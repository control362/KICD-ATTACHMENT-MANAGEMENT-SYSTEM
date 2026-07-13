package com.example.kicd.exceptions;

/**
 * Thrown whenever a lookup by id/email/token finds nothing.
 * Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
