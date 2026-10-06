package com.smartparking;

import com.smartparking.dto.ApiResponse;
import com.smartparking.exception.AppException;
import com.smartparking.exception.GlobalExceptionHandler;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.exception.SlotUnavailableException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @RestController
    static class TestController {
        @GetMapping("/test/slot-unavailable")
        public void throwSlotUnavailable() {
            throw new SlotUnavailableException("Bay A-01 is occupied");
        }

        @GetMapping("/test/not-found")
        public void throwNotFound() {
            throw new ResourceNotFoundException("Slot", "id", 999L);
        }

        @PostMapping("/test/validation")
        public ResponseEntity<String> testValidation(@Valid @RequestBody TestRequest request) {
            return ResponseEntity.ok("Valid");
        }
    }

    static class TestRequest {
        @NotBlank(message = "License plate must not be blank")
        private String licensePlate;

        public String getLicensePlate() {
            return licensePlate;
        }

        public void setLicensePlate(String licensePlate) {
            this.licensePlate = licensePlate;
        }
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("SlotUnavailableException returns 409 with SLOT_UNAVAILABLE errorCode")
    void handleSlotUnavailableException() throws Exception {
        mockMvc.perform(get("/test/slot-unavailable"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("SLOT_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Bay A-01 is occupied"));
    }

    @Test
    @DisplayName("ResourceNotFoundException returns 404 with RESOURCE_NOT_FOUND errorCode")
    void handleResourceNotFoundException() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Slot not found with id: '999'"));
    }

    @Test
    @DisplayName("Bean Validation failure returns 400 with VALIDATION_FAILED errorCode and error list")
    void handleValidationException() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"licensePlate\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors[0]").value("licensePlate: License plate must not be blank"));
    }
}
