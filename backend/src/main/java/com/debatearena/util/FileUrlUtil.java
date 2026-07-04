package com.debatearena.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;

/**
 * =====================================================================
 * File URL Utility
 * =====================================================================
 * 
 * Utility component to consistently construct file URLs for local storage.
 * Handles the port configuration and context path properly.
 * 
 * @author TarkVtark Team
 */
@Component
public class FileUrlUtil {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${file.base-url:http://localhost}")
    private String fileBaseUrl;

    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    /**
     * Construct a complete file URL for local storage files
     * 
     * Example output: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
     * 
     * @param storageKey the storage key relative path (e.g., attachments/uuid.jpg)
     * @return complete URL for accessing the file
     */
    public String constructFileUrl(String storageKey) {
        if (storageKey == null || storageKey.isEmpty()) {
            return null;
        }

        // Clean up baseUrl: remove trailing slashes and any existing port
        String baseUrl = fileBaseUrl.replaceAll("/+$", "").replaceAll(":\\d+$", "");
        
        // Ensure baseUrl contains protocol
        if (!baseUrl.startsWith("http")) {
            baseUrl = "http://" + baseUrl;
        }

        // Construct complete URL: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
        String cleanContextPath = contextPath.replaceAll("/+$", "");
        return baseUrl + ":" + serverPort + cleanContextPath + "/files/key/" + storageKey;
    }

    /**
     * Construct file URL from HttpServletRequest (extract host and port from request)
     * This is more reliable when running locally as it uses the actual request information
     * 
     * @param request the HTTP request
     * @param storageKey the storage key
     * @return complete URL for accessing the file
     */
    public String constructFileUrlFromRequest(HttpServletRequest request, String storageKey) {
        if (storageKey == null || storageKey.isEmpty()) {
            return null;
        }

        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        String contextPath = request.getContextPath();

        // Construct URL: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
        String fileBaseUrl = String.format("%s://%s:%d%s/files/key/%s", scheme, host, port, contextPath, storageKey);
        return fileBaseUrl;
    }
}

