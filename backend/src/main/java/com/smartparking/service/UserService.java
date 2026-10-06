package com.smartparking.service;

import com.smartparking.dto.auth.UpdateProfileRequest;
import com.smartparking.dto.auth.UserProfileResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.User;
import com.smartparking.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing user profile access and updates with strict IDOR protections.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId, "USER_NOT_FOUND"));
        return UserProfileResponse.fromUser(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId, "USER_NOT_FOUND"));

        String phone = request.getPhoneNumber().trim();
        if (!phone.equals(user.getPhoneNumber()) && userRepository.existsByPhoneNumber(phone)) {
            throw new BadRequestException("Phone number is already registered by another account", "PHONE_ALREADY_EXISTS");
        }

        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(phone);
        userRepository.update(user);

        return UserProfileResponse.fromUser(user);
    }

    public UserProfileResponse getUserById(Long targetUserId, Long authenticatedUserId, boolean isAdmin) {
        // Enforce IDOR protection: only the account owner or system administrators can view account details
        if (!isAdmin && !targetUserId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You cannot view another user's profile");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId, "USER_NOT_FOUND"));

        return UserProfileResponse.fromUser(user);
    }

    public List<UserProfileResponse> getAllUsers(int offset, int limit) {
        return userRepository.findAll(offset, limit)
                .stream()
                .map(UserProfileResponse::fromUser)
                .toList();
    }

    public long countUsers() {
        return userRepository.count();
    }
}
