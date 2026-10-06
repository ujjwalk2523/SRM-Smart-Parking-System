package com.smartparking.security;

import com.smartparking.model.User;
import com.smartparking.model.UserStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * Spring Security UserDetails representation of an authenticated user.
 */
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String fullName;
    private final String phoneNumber;
    private final String roleName;
    private final UserStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String password, String fullName,
                         String phoneNumber, String roleName, UserStatus status,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.roleName = roleName;
        this.status = status;
        this.authorities = authorities;
    }

    public static UserPrincipal fromUser(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRoleName() != null) {
            String role = user.getRoleName().toUpperCase();
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }
            authorities.add(new SimpleGrantedAuthority(role));

            // Ensure compatibility between ROLE_CUSTOMER and ROLE_USER
            if ("ROLE_CUSTOMER".equals(role)) {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            } else if ("ROLE_USER".equals(role)) {
                authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
            }
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
        }

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRoleName(),
                user.getStatus(),
                Collections.unmodifiableList(authorities)
        );
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getRoleName() {
        return roleName;
    }

    public UserStatus getStatus() {
        return status;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
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
        return status != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
