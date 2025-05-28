package com.music.newnewmusic.controller;

import com.music.newnewmusic.model.User;
import com.music.newnewmusic.payload.request.PasswordUpdateRequest;
import com.music.newnewmusic.payload.request.ProfileUpdateRequest;
import com.music.newnewmusic.payload.response.MessageResponse;
import com.music.newnewmusic.repository.UserRepository;
import com.music.newnewmusic.security.UserDetailsImpl;
import com.music.newnewmusic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.music.newnewmusic.payload.response.JwtResponse;
import com.music.newnewmusic.security.jwt.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody ProfileUpdateRequest profileUpdateRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            User updatedUser = userService.updateUserProfile(userDetails.getId(), profileUpdateRequest);

            // Regenerate JWT token if username is updated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl currentUserDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Create a new Authentication object with the updated username if it has changed
            // This step is crucial if the username is part of the JWT claims and affects token validity.
            // However, directly creating a new Authentication object here might bypass some security checks
            // or not reflect the true state of authentication if other details (like roles) also need updating.
            // A more robust solution might involve re-authenticating the user or ensuring the JWT generation
            // logic can be invoked with updated UserDetails.

            // For now, let's assume the primary concern is the username in the token.
            // We will generate a new token based on the existing authentication principal, updated with the new username.
            // This requires that UserDetailsImpl can be updated or a new one created with the new username.

            // If the username was changed, we need to update the principal in the security context
            // and generate a new token.
            String newJwt = jwtUtils.generateJwtToken(authentication); // This will use the username from the current principal

            // If the username itself was updated, the above token will still contain the old username.
            // We need to ensure the Authentication object reflects the *new* username before generating the token.
            // One way is to create a new UserDetailsImpl with the updatedUser details.
            UserDetailsImpl newPrincipal = UserDetailsImpl.build(updatedUser);
            Authentication newAuthentication = new UsernamePasswordAuthenticationToken(newPrincipal, authentication.getCredentials(), newPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(newAuthentication);
            newJwt = jwtUtils.generateJwtToken(newAuthentication);

            return ResponseEntity.ok(new JwtResponse(newJwt,
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    currentUserDetails.getAuthorities().stream().map(item -> item.getAuthority()).collect(java.util.stream.Collectors.toList())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updateUserPassword(@Valid @RequestBody PasswordUpdateRequest passwordUpdateRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            userService.updateUserPassword(userDetails.getId(), passwordUpdateRequest);
            return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

}