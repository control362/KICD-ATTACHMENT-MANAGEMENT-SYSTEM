package com.example.kicd.serviceInterfaces;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

public interface DocumentStorageService {
    String storeFile(MultipartFile file, Long userId);
    Resource loadFileAsResource(String fileName);
}
