package com.smartparking;

import com.smartparking.controller.HealthController;
import com.smartparking.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        HealthController controller = new HealthController(jdbcTemplate);
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/health returns 200 UP and CONNECTED when database is healthy")
    void healthCheck_Success() throws Exception {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);

        mockMvc.perform(get("/api/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("System and database are healthy"))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.database").value("CONNECTED"))
                .andExpect(jsonPath("$.data.version").value("2.0.0"));
    }

    @Test
    @DisplayName("GET /api/health returns 503 when database is unreachable")
    void healthCheck_DatabaseDown() throws Exception {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
                .thenThrow(new DataAccessResourceFailureException("Connection refused"));

        mockMvc.perform(get("/api/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("DATABASE_UNAVAILABLE"))
                .andExpect(jsonPath("$.data.database").value("DISCONNECTED"));
    }
}
