package com.debatearena.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/internal")
public class StorageDiagnosticController {

    @Value("${file.provider:local}")
    private String fileProvider;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${aws.s3.bucket:}")
    private String awsBucket;

    @GetMapping("/storage")
    public ResponseEntity<?> storageInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("file.provider", fileProvider);
        info.put("file.upload-dir", uploadDir);
        info.put("aws.s3.bucket", awsBucket);

        // Check AWS credentials availability (DefaultCredentialsProvider)
        boolean credsResolved = false;
        String credsMessage = "";
        try {
            AwsCredentialsProvider provider = DefaultCredentialsProvider.create();
            AwsCredentials creds = provider.resolveCredentials();
            credsResolved = creds != null && creds.accessKeyId() != null && !creds.accessKeyId().isEmpty();
            credsMessage = credsResolved ? "resolved" : "not-resolved";
        } catch (Exception e) {
            credsResolved = false;
            credsMessage = e.getMessage();
        }

        info.put("aws.credentials.available", credsResolved);
        info.put("aws.credentials.message", credsMessage);

        return ResponseEntity.ok(info);
    }
}

