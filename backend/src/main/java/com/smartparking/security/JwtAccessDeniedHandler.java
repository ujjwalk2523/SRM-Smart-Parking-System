package com.smartparking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartparking.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles forbidden access attempts by returning a standardized 403 JSON response.
 */
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private static final Logger logger = LoggerFactory.getLogger(JwtAccessDeniedHandler.class);
    private final ObjectMapper objectMapper;

    public JwtAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        logger.warn("Access denied for URI {}: {}", request.getRequestURI(), accessDeniedException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ApiResponse<Object> apiResponse = ApiResponse.error(
                "Access denied: You do not have permission to access this resource",
                "ACCESS_DENIED"
        );

        response.getOutputStream().println(objectMapper.writeValueAsString(apiResponse));
    }
}
