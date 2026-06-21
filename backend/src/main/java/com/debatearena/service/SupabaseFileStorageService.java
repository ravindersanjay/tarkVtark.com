package com.debatearena.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Supabase Storage implementation using the Supabase Storage REST API.
 * <p>
 * - Uploads using POST /storage/v1/object/{bucket} with multipart/form-data
 * - Deletes using DELETE /storage/v1/object/{bucket}/{path}
 * <p>
 * Requires server-side (service_role) key in configuration: `supabase.service-role-key`.
 */
@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "supabase")
public class SupabaseFileStorageService implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseFileStorageService.class);

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${supabase.storage-bucket:attachments}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (supabaseUrl == null || supabaseUrl.isBlank() || serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new IOException("Supabase storage is not configured (supabase.url or supabase.service-role-key missing)");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String uniqueFileName = UUID.randomUUID().toString() + ext;
        String path = (folder != null && !folder.isBlank()) ? folder.replaceAll("[^a-zA-Z0-9/_-]", "_") + "/" + uniqueFileName : uniqueFileName;

        // Build multipart/form-data body where filename contains the path
        String boundary = "----DebateArenaBoundary" + UUID.randomUUID().toString();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String lineSep = "\r\n";

        StringBuilder sb = new StringBuilder();
        sb.append("--").append(boundary).append(lineSep);
        sb.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                .append(path).append('\"').append(lineSep);
        sb.append("Content-Type: ").append(file.getContentType() == null ? "application/octet-stream" : file.getContentType()).append(lineSep).append(lineSep);

        baos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
        baos.write(file.getBytes());
        baos.write(lineSep.getBytes(StandardCharsets.UTF_8));

        String end = "--" + boundary + "--" + lineSep;
        baos.write(end.getBytes(StandardCharsets.UTF_8));

        byte[] body = baos.toByteArray();

        String uploadUrl = supabaseUrl.replaceAll("/+$", "") + "/storage/v1/object/" + bucket;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

        try {
            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = resp.statusCode();
            if (status >= 200 && status < 300) {
                // Return public URL for the object (assumes public bucket). If your bucket is private, you may want to store the path instead.
                String publicUrl = supabaseUrl.replaceAll("/+$", "") + "/storage/v1/object/public/" + bucket + "/" + path;
                logger.info("Supabase upload succeeded: {} -> {}", originalFilename, publicUrl);
                return publicUrl;
            } else {
                logger.error("Supabase upload failed (status={}): {}", status, resp.body());
                throw new IOException("Supabase upload failed: " + status + " " + resp.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Upload interrupted", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) throws IOException {
        if (supabaseUrl == null || supabaseUrl.isBlank() || serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new IOException("Supabase storage is not configured (supabase.url or supabase.service-role-key missing)");
        }

        // Determine object path from fileUrl. Accept either a public URL or a stored key/path.
        String key = fileUrl;
        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath();
            if (path != null) {
                // path may be /storage/v1/object/public/{bucket}/{path} or /storage/v1/object/{bucket}/{path}
                String prefixPublic = "/storage/v1/object/public/" + bucket + "/";
                String prefix = "/storage/v1/object/" + bucket + "/";
                if (path.startsWith(prefixPublic)) {
                    key = path.substring(prefixPublic.length());
                } else if (path.startsWith(prefix)) {
                    key = path.substring(prefix.length());
                } else {
                    // if path starts with '/', strip it
                    if (path.startsWith("/")) {
                        key = path.substring(1);
                    } else {
                        key = path;
                    }
                }
            }
        } catch (IllegalArgumentException ignored) {
            // not a URI: assume fileUrl is already a key/path
            key = fileUrl;
        }

        // Build delete URL: DELETE /storage/v1/object/{bucket}/{path}
        String deleteUrl = supabaseUrl.replaceAll("/+$", "") + "/storage/v1/object/" + bucket + "/" + key;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(deleteUrl))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .DELETE()
                .build();

        try {
            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = resp.statusCode();
            if (status >= 200 && status < 300) {
                logger.info("Supabase delete succeeded: {}", key);
            } else {
                logger.warn("Supabase delete returned status {}: {}", status, resp.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Delete interrupted", e);
        }
    }

    @Override
    public String getProviderName() {
        return "supabase";
    }
}

