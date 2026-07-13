package com.example.kicd.exceptions;

/**
 * Thrown for authentication failures: wrong password, unverified email,
 * locked account, expired/invalid token. Mapped to HTTP 401.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
