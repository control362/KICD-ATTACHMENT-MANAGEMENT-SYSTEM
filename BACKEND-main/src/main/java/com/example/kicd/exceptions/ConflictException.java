package com.example.kicd.exceptions;

/**
 * Thrown for state conflicts: duplicate email, applying twice, acting on an
 * already-decided application, etc. Mapped to HTTP 409.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
