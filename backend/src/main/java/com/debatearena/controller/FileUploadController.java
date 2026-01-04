package com.debatearena.controller;

import com.debatearena.dto.AttachmentDTO;
import com.debatearena.dto.EvidenceUrlDTO;
import com.debatearena.model.Attachment;
import com.debatearena.model.EvidenceUrl;
import com.debatearena.model.Question;
import com.debatearena.model.Reply;
import com.debatearena.repository.AttachmentRepository;
import com.debatearena.repository.EvidenceUrlRepository;
import com.debatearena.repository.QuestionRepository;
import com.debatearena.repository.ReplyRepository;
import com.debatearena.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * =====================================================================
 * File Upload Controller
 * =====================================================================
 *
 * Handles file uploads and downloads for question and reply attachments.
 *
 * ENDPOINTS:
 * POST   /api/v1/files/upload           - Upload a file
 * GET    /api/v1/files/{filename}       - Download/view a file
 * DELETE /api/v1/files/{id}             - Delete an attachment
 * POST   /api/v1/files/evidence-url     - Add an evidence URL
 * DELETE /api/v1/files/evidence-url/{id} - Delete an evidence URL
 * GET    /api/v1/files/attachments      - Get attachments for question/reply
 * GET    /api/v1/files/evidence-urls    - Get evidence URLs for question/reply
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private EvidenceUrlRepository evidenceUrlRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ReplyRepository replyRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.max-size:10485760}") // 10MB default
    private long maxFileSize;

    /**
     * Upload a file and create attachment record
     *
     * @param file File to upload
     * @param questionId ID of the question (optional)
     * @param replyId ID of the reply (optional)
     * @param uploadedBy Name of uploader (optional)
     * @return AttachmentDTO with storage URL
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) UUID questionId,
            @RequestParam(required = false) UUID replyId,
            @RequestParam(required = false) String uploadedBy
    ) {
        try {
            // Validation
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            if (file.getSize() > maxFileSize) {
                return ResponseEntity.badRequest().body("File size exceeds maximum allowed: " + maxFileSize + " bytes");
            }

            if (questionId == null && replyId == null) {
                return ResponseEntity.badRequest().body("Either questionId or replyId must be provided");
            }

            if (questionId != null && replyId != null) {
                return ResponseEntity.badRequest().body("Cannot attach to both question and reply");
            }

            // Upload file to storage
            String storageUrl = fileStorageService.uploadFile(file, null);

            // Create attachment record
            Attachment attachment = new Attachment();
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileSize(file.getSize());
            attachment.setFileType(file.getContentType());
            attachment.setStorageUrl(storageUrl);
            attachment.setStorageProvider(fileStorageService.getProviderName());
            attachment.setUploadedBy(uploadedBy != null ? uploadedBy : "Anonymous");

            // Set parent (question or reply)
            if (questionId != null) {
                Question question = questionRepository.findById(questionId)
                        .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
                attachment.setQuestion(question);
            } else {
                Reply reply = replyRepository.findById(replyId)
                        .orElseThrow(() -> new RuntimeException("Reply not found: " + replyId));
                attachment.setReply(reply);
            }

            // Save to database
            Attachment saved = attachmentRepository.save(attachment);

            logger.info("File uploaded successfully: {} ({})", file.getOriginalFilename(), saved.getId());

            return ResponseEntity.ok(AttachmentDTO.fromEntity(saved));

        } catch (IOException e) {
            logger.error("File upload failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File upload failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during file upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Download or view a file
     *
     * @param filename Name of the file
     * @return File content with appropriate headers
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (IOException e) {
            logger.error("File download failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an attachment
     *
     * @param id Attachment ID
     * @return Success or error message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttachment(@PathVariable UUID id) {
        try {
            Attachment attachment = attachmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attachment not found: " + id));

            // Delete file from storage
            fileStorageService.deleteFile(attachment.getStorageUrl());

            // Delete database record
            attachmentRepository.delete(attachment);

            logger.info("Attachment deleted: {}", id);

            return ResponseEntity.ok("Attachment deleted successfully");

        } catch (IOException e) {
            logger.error("Failed to delete file from storage", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to delete attachment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete attachment: " + e.getMessage());
        }
    }

    /**
     * Add an evidence URL
     *
     * @param url URL to add
     * @param questionId ID of the question (optional)
     * @param replyId ID of the reply (optional)
     * @param title Optional title/description
     * @return EvidenceUrlDTO
     */
    @PostMapping("/evidence-url")
    public ResponseEntity<?> addEvidenceUrl(
            @RequestParam String url,
            @RequestParam(required = false) UUID questionId,
            @RequestParam(required = false) UUID replyId,
            @RequestParam(required = false) String title
    ) {
        try {
            if (questionId == null && replyId == null) {
                return ResponseEntity.badRequest().body("Either questionId or replyId must be provided");
            }

            if (questionId != null && replyId != null) {
                return ResponseEntity.badRequest().body("Cannot attach to both question and reply");
            }

            EvidenceUrl evidenceUrl = new EvidenceUrl();
            evidenceUrl.setUrl(url);
            evidenceUrl.setTitle(title);

            // Set parent (question or reply)
            if (questionId != null) {
                Question question = questionRepository.findById(questionId)
                        .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
                evidenceUrl.setQuestion(question);
            } else {
                Reply reply = replyRepository.findById(replyId)
                        .orElseThrow(() -> new RuntimeException("Reply not found: " + replyId));
                evidenceUrl.setReply(reply);
            }

            EvidenceUrl saved = evidenceUrlRepository.save(evidenceUrl);

            logger.info("Evidence URL added: {}", saved.getId());

            return ResponseEntity.ok(EvidenceUrlDTO.fromEntity(saved));

        } catch (Exception e) {
            logger.error("Failed to add evidence URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add evidence URL: " + e.getMessage());
        }
    }

    /**
     * Delete an evidence URL
     *
     * @param id Evidence URL ID
     * @return Success or error message
     */
    @DeleteMapping("/evidence-url/{id}")
    public ResponseEntity<?> deleteEvidenceUrl(@PathVariable UUID id) {
        try {
            EvidenceUrl evidenceUrl = evidenceUrlRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Evidence URL not found: " + id));

            evidenceUrlRepository.delete(evidenceUrl);

            logger.info("Evidence URL deleted: {}", id);

            return ResponseEntity.ok("Evidence URL deleted successfully");

        } catch (Exception e) {
            logger.error("Failed to delete evidence URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete evidence URL: " + e.getMessage());
        }
    }

    /**
     * Get all attachments for a question or reply
     *
     * @param questionId Question ID (optional)
     * @param replyId Reply ID (optional)
     * @return List of AttachmentDTOs
     */
    @GetMapping("/attachments")
    public ResponseEntity<?> getAttachments(
            @RequestParam(required = false) UUID questionId,
            @RequestParam(required = false) UUID replyId
    ) {
        try {
            List<Attachment> attachments;

            if (questionId != null) {
                attachments = attachmentRepository.findByQuestionId(questionId);
            } else if (replyId != null) {
                attachments = attachmentRepository.findByReplyId(replyId);
            } else {
                return ResponseEntity.badRequest().body("Either questionId or replyId must be provided");
            }

            List<AttachmentDTO> dtos = attachments.stream()
                    .map(AttachmentDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            logger.error("Failed to get attachments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get attachments: " + e.getMessage());
        }
    }

    /**
     * Get all evidence URLs for a question or reply
     *
     * @param questionId Question ID (optional)
     * @param replyId Reply ID (optional)
     * @return List of EvidenceUrlDTOs
     */
    @GetMapping("/evidence-urls")
    public ResponseEntity<?> getEvidenceUrls(
            @RequestParam(required = false) UUID questionId,
            @RequestParam(required = false) UUID replyId
    ) {
        try {
            List<EvidenceUrl> evidenceUrls;

            if (questionId != null) {
                evidenceUrls = evidenceUrlRepository.findByQuestionId(questionId);
            } else if (replyId != null) {
                evidenceUrls = evidenceUrlRepository.findByReplyId(replyId);
            } else {
                return ResponseEntity.badRequest().body("Either questionId or replyId must be provided");
            }

            List<EvidenceUrlDTO> dtos = evidenceUrls.stream()
                    .map(EvidenceUrlDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            logger.error("Failed to get evidence URLs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get evidence URLs: " + e.getMessage());
        }
    }
}

