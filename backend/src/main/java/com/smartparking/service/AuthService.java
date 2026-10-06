package com.smartparking.service;

import com.smartparking.dto.auth.AuthResponse;
import com.smartparking.dto.auth.LoginRequest;
import com.smartparking.dto.auth.RegisterRequest;
import com.smartparking.dto.auth.UserProfileResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.AuditLog;
import com.smartparking.model.Role;
import com.smartparking.model.User;
import com.smartparking.model.UserStatus;
import com.smartparking.repository.AuditLogRepository;
import com.smartparking.repository.RoleRepository;
import com.smartparking.repository.UserRepository;
import com.smartparking.security.JwtTokenProvider;
import com.smartparking.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service orchestrating user registration, authentication, token issuance, and audit logging.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       AuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhoneNumber().trim();

        if (userRepository.existsByEmail(email)) {
            logger.warn("Registration rejected: Duplicate email '{}'", email);
            throw new BadRequestException("Email is already registered", "EMAIL_ALREADY_EXISTS");
        }

        if (userRepository.existsByPhoneNumber(phone)) {
            logger.warn("Registration rejected: Duplicate phone number '{}'", phone);
            throw new BadRequestException("Phone number is already registered", "PHONE_ALREADY_EXISTS");
        }

        // Locate or bootstrap standard customer role
        Role role = roleRepository.findByName("ROLE_CUSTOMER")
                .or(() -> roleRepository.findByName("ROLE_USER"))
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER", "Standard Registered Customer")));

        User user = new User();
        user.setRoleId(role.getId());
        user.setRoleName(role.getName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(phone);
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Record audit trail
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(user.getId());
        auditLog.setUserEmail(user.getEmail());
        auditLog.setAction("USER_REGISTER");
        auditLog.setEntityType("USER");
        auditLog.setEntityId(user.getId());
        auditLog.setIpAddress(SecurityUtils.getClientIp(httpRequest));
        auditLog.setUserAgent(SecurityUtils.getUserAgent(httpRequest));
        auditLogRepository.save(auditLog);

        logger.info("User registered successfully: id={}, email={}", user.getId(), user.getEmail());

        String token = tokenProvider.generateTokenFromUser(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRoleName()
        );

        return new AuthResponse(token, tokenProvider.getExpirationMs(), UserProfileResponse.fromUser(user));
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            logger.warn("Authentication failed for email: {}", email);

            AuditLog failLog = new AuditLog();
            failLog.setAction("LOGIN_FAILED");
            failLog.setEntityType("USER");
            failLog.setUserEmail(email);
            failLog.setIpAddress(SecurityUtils.getClientIp(httpRequest));
            failLog.setUserAgent(SecurityUtils.getUserAgent(httpRequest));
            auditLogRepository.save(failLog);

            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            logger.warn("Login attempt for inactive user account: id={}, status={}", user.getId(), user.getStatus());
            throw new BadRequestException("User account is " + user.getStatus(), "ACCOUNT_DISABLED");
        }

        // Record successful login audit
        AuditLog successLog = new AuditLog();
        successLog.setUserId(user.getId());
        successLog.setUserEmail(user.getEmail());
        successLog.setAction("USER_LOGIN");
        successLog.setEntityType("USER");
        successLog.setEntityId(user.getId());
        successLog.setIpAddress(SecurityUtils.getClientIp(httpRequest));
        successLog.setUserAgent(SecurityUtils.getUserAgent(httpRequest));
        auditLogRepository.save(successLog);

        logger.info("User logged in successfully: id={}, email={}", user.getId(), user.getEmail());

        String token = tokenProvider.generateTokenFromUser(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRoleName()
        );

        return new AuthResponse(token, tokenProvider.getExpirationMs(), UserProfileResponse.fromUser(user));
    }

    public UserProfileResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId, "USER_NOT_FOUND"));
        return UserProfileResponse.fromUser(user);
    }

    public void logout(Long userId, HttpServletRequest httpRequest) {
        if (userId != null) {
            AuditLog logoutLog = new AuditLog();
            logoutLog.setUserId(userId);
            logoutLog.setAction("USER_LOGOUT");
            logoutLog.setEntityType("USER");
            logoutLog.setEntityId(userId);
            logoutLog.setIpAddress(SecurityUtils.getClientIp(httpRequest));
            logoutLog.setUserAgent(SecurityUtils.getUserAgent(httpRequest));
            auditLogRepository.save(logoutLog);
            logger.info("User logged out: id={}", userId);
        }
    }
}
