package com.example.kicd;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@SuperBuilder
@NoArgsConstructor
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Builder.Default
    @Column(name = "public_id", nullable = false, unique = true)
    private UUID publicId = UUID.randomUUID();


    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();


    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();


    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;


    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        publicId = UUID.randomUUID();
        isDeleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
