package com.debatearena.controller;

import com.debatearena.dto.ContactMessageDTO;
import com.debatearena.dto.ContactRequest;
import com.debatearena.model.ContactMessage;
import com.debatearena.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * =====================================================================
 * Contact Controller
 * =====================================================================
 *
 * REST API endpoints for contact message operations.
 * Base URL: /api/v1/contact
 *
 * Endpoints:
 * - POST   /contact - Submit a contact message
 * - GET    /contact/messages - Get all contact messages (admin)
 * - GET    /contact/messages/unread - Get unread messages (admin)
 * - PUT    /contact/messages/{id}/read - Mark message as read
 * - DELETE /contact/messages/{id} - Delete a message
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    /**
     * POST /contact
     * Submit a new contact message
     *
     * @param request Contact request with name, email, subject, message
     * @return Created contact message DTO
     */
    @PostMapping
    public ResponseEntity<ContactMessageDTO> submitMessage(@RequestBody ContactRequest request) {
        System.out.println("📧 POST /contact - Submitting message from: " + request.getEmail());

        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        ContactMessage saved = contactMessageRepository.save(message);
        System.out.println("✅ Message saved with ID: " + saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(ContactMessageDTO.fromEntity(saved));
    }

    /**
     * GET /contact/messages
     * Get all contact messages (admin only)
     *
     * @return List of all contact messages
     */
    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessageDTO>> getAllMessages() {
        System.out.println("📬 GET /contact/messages - Fetching all messages");

        List<ContactMessage> messages = contactMessageRepository.findAll();
        List<ContactMessageDTO> dtos = messages.stream()
                .map(ContactMessageDTO::fromEntity)
                .collect(Collectors.toList());

        System.out.println("✅ Returning " + dtos.size() + " messages");
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /contact/messages/unread
     * Get all unread contact messages (admin only)
     *
     * @return List of unread contact messages
     */
    @GetMapping("/messages/unread")
    public ResponseEntity<List<ContactMessageDTO>> getUnreadMessages() {
        System.out.println("📬 GET /contact/messages/unread - Fetching unread messages");

        List<ContactMessage> messages = contactMessageRepository.findByIsReadFalse();
        List<ContactMessageDTO> dtos = messages.stream()
                .map(ContactMessageDTO::fromEntity)
                .collect(Collectors.toList());

        System.out.println("✅ Returning " + dtos.size() + " unread messages");
        return ResponseEntity.ok(dtos);
    }

    /**
     * PUT /contact/messages/{id}/read
     * Mark a message as read
     *
     * @param id Message ID
     * @return Updated message DTO
     */
    @PutMapping("/messages/{id}/read")
    public ResponseEntity<ContactMessageDTO> markAsRead(@PathVariable UUID id) {
        System.out.println("✉️ PUT /contact/messages/" + id + "/read - Marking message as read");

        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));

        message.markAsRead();
        ContactMessage updated = contactMessageRepository.save(message);

        System.out.println("✅ Message marked as read");
        return ResponseEntity.ok(ContactMessageDTO.fromEntity(updated));
    }

    /**
     * PUT /contact/messages/{id}/unread
     * Mark a message as unread
     *
     * @param id Message ID
     * @return Updated message DTO
     */
    @PutMapping("/messages/{id}/unread")
    public ResponseEntity<ContactMessageDTO> markAsUnread(@PathVariable UUID id) {
        System.out.println("📭 PUT /contact/messages/" + id + "/unread - Marking message as unread");

        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));

        message.markAsUnread();
        ContactMessage updated = contactMessageRepository.save(message);

        System.out.println("✅ Message marked as unread");
        return ResponseEntity.ok(ContactMessageDTO.fromEntity(updated));
    }

    /**
     * DELETE /contact/messages/{id}
     * Delete a contact message
     *
     * @param id Message ID
     * @return No content
     */
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        System.out.println("🗑️ DELETE /contact/messages/" + id + " - Deleting message");

        if (!contactMessageRepository.existsById(id)) {
            System.out.println("❌ Message not found");
            return ResponseEntity.notFound().build();
        }

        contactMessageRepository.deleteById(id);
        System.out.println("✅ Message deleted successfully");

        return ResponseEntity.noContent().build();
    }
}

