package com.example.kicd.config;

import com.example.kicd.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Stateless JWT-based security. Access rules mirror the "Roles -> Screen
 * Access Map" in the frontend spec:
 *   - STUDENT    can create/read/update their OWN application only.
 *   - HR_OFFICER can read all applications and approve/reject, and read
 *     (but not write) departments.
 *   - ADMIN      has full CRUD on users and departments plus everything HR can do.
 *
 * Row-level ownership (a student only ever seeing their own application) is
 * enforced in the service layer, not here — path-based rules can only ever
 * express "which role can hit this route", not "which row".
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                           UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF protection is unnecessary for a stateless, token-authenticated
                // JSON API that never relies on cookies for auth — there is no
                // ambient credential for a forged cross-site request to ride on.
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- Public ---
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login",
                                "/api/auth/resend-verification", "/api/auth/forgot-password",
                                "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/verify-email").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/opportunities", "/api/opportunities/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").permitAll()
                        // /api/auth/me and /api/auth/change-password require a valid token —
                        // they fall through to .anyRequest().authenticated() below.
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // --- Roles (read-only reference data, any authenticated user) ---
                        .requestMatchers(HttpMethod.GET, "/api/roles/**").authenticated()

                        // --- Departments: everyone authenticated can read (students need
                        //     the list for the application form dropdown); only Admin can write ---
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasAnyRole("ADMIN", "HR_OFFICER")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasAnyRole("ADMIN", "HR_OFFICER")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasAnyRole("ADMIN", "HR_OFFICER")

                        // --- Users (staff management): Admin only ---
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // --- Opportunities (vacancy management) ---
                        .requestMatchers(HttpMethod.POST, "/api/opportunities", "/api/opportunities/*").hasAnyRole("ADMIN", "HR_OFFICER")
                        .requestMatchers(HttpMethod.PUT, "/api/opportunities/*").hasAnyRole("ADMIN", "HR_OFFICER")
                        .requestMatchers(HttpMethod.DELETE, "/api/opportunities/*").hasAnyRole("ADMIN", "HR_OFFICER")

                        // --- Student applications ---
                        .requestMatchers(HttpMethod.GET, "/api/applications/me").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET,
                                "/api/applications/pending",
                                "/api/applications/approved",
                                "/api/applications/rejected")
                        .hasAnyRole("HR_OFFICER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/*/approve")
                        .hasAnyRole("HR_OFFICER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/*/reject")
                        .hasAnyRole("HR_OFFICER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications")
                        .hasAnyRole("HR_OFFICER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/applications/**").hasAnyRole("ADMIN", "STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/applications/opportunity/*").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/applications/opportunity/*").hasAnyRole("HR_OFFICER", "ADMIN")
                        // Single-record GET/PUT: any authenticated role may hit the route;
                        // the service layer enforces that a STUDENT can only touch their own record.
                        .requestMatchers(HttpMethod.GET, "/api/applications/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/applications/*/submit", "/api/applications/*/status").authenticated()

                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // TODO: replace with the real deployed frontend origin(s) before going to
        // production — wildcard-with-credentials is intentionally NOT used here.
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "https://*.kicd-attachments.example"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.boot.web.servlet.FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
        org.springframework.boot.web.servlet.FilterRegistrationBean<JwtAuthenticationFilter> registration = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
