package com.example.kicd.serviceImplimentations;

import com.example.kicd.DTOS.UserDTO;
import com.example.kicd.entities.Role;
import com.example.kicd.entities.User;
import com.example.kicd.exceptions.ConflictException;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.repositories.RoleRepository;
import com.example.kicd.repositories.UserRepository;
import com.example.kicd.serviceInterfaces.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Admin-only staff account management (see UserDTO). This intentionally does
 * NOT handle student self-registration — that's AuthServiceImpl, which never
 * trusts a client-supplied roleId.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User createUser(UserDTO dto) {

        String email = dto.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("A user with this email already exists.");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required when creating a user.");
        }

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .isActive(true)
                // Staff accounts created by an Admin are pre-verified — there is
                // no self-service verification loop for internally-provisioned accounts.
                .emailVerified(true)
                .failedLoginAttempts(0)
                .build();

        return userRepository.save(user);
    }

    @Override
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateUser(Long id, UserDTO dto) {

        User user = getUser(id);

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        String newEmail = dto.getEmail().trim().toLowerCase();
        if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new ConflictException("A user with this email already exists.");
        }

        user.setRole(role);
        user.setEmail(newEmail);

        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }
}
