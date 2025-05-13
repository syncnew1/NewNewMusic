package com.music.newnewmusic.security.jwt;

import com.music.newnewmusic.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll() // Example: Allow public access to test endpoints
                        // Publicly accessible song GET endpoints
                        .requestMatchers(HttpMethod.GET, "/api/songs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/songs/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/songs/stream/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/songs/{id:[\\w-]+}").permitAll() // Matches song IDs, not "favorites"
                        // Authenticated song favorite endpoints
                        .requestMatchers(HttpMethod.POST, "/api/songs/{songId}/favorite").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/songs/{songId}/favorite").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/songs/favorites").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/songs/{songId}/isFavorite").authenticated()
                        // Other requests require authentication
                        .anyRequest().authenticated());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}