package com.example.kicd.security;

import com.example.kicd.entities.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Adapts our {@link User} entity to what Spring Security expects, and is
 * also what {@link JwtAuthenticationFilter} puts into the SecurityContext
 * for the duration of each request. Controllers can pull the current user's
 * id/role straight from this instead of trusting a path variable.
 */
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final boolean active;
    private final boolean accountNonLocked;

    public UserPrincipal(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.role = user.getRole().getRoleName();
        this.active = Boolean.TRUE.equals(user.getIsActive());
        OffsetDateTime lockedUntil = user.getAccountLockedUntil();
        this.accountNonLocked = lockedUntil == null || lockedUntil.isBefore(OffsetDateTime.now());
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role != null && role.startsWith("ROLE_")) {
            return List.of(new SimpleGrantedAuthority(role));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
