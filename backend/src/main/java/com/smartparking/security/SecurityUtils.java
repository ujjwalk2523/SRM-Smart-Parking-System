package com.smartparking.security;

import com.smartparking.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Security helper methods to inspect the authenticated principal and prevent IDOR vulnerabilities.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getId)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getEmail)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static boolean isCurrentUserAdmin() {
        return getCurrentUserPrincipal()
                .map(p -> p.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority())))
                .orElse(false);
    }

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) return "0.0.0.0";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "0.0.0.0";
    }

    public static String getUserAgent(HttpServletRequest request) {
        if (request == null) return "Unknown";
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua : "Unknown";
    }
}
