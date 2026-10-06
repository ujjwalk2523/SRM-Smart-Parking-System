package com.smartparking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

/**
 * Main application entry point for the Smart Parking System.
 * Explicitly excludes HibernateJpaAutoConfiguration to strictly enforce Spring JDBC.
 */
@SpringBootApplication(exclude = {HibernateJpaAutoConfiguration.class})
public class SmartParkingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartParkingApplication.class, args);
    }
}
