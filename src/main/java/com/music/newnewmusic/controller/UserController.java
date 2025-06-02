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

            // 如果用户名更新，重新生成JWT令牌
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl currentUserDetails = (UserDetailsImpl) authentication.getPrincipal();

            // 如果用户名发生变化，创建一个新的Authentication对象
            // 如果用户名是JWT声明的一部分并影响令牌有效性，这一步至关重要。
            // 然而，直接在这里创建新的Authentication对象可能会绕过一些安全检查
            // 或者不能反映认证的真实状态，如果其他详细信息（如角色）也需要更新。
            // 更稳健的解决方案可能涉及重新认证用户或确保JWT生成
            // 逻辑可以使用更新的UserDetails调用。
            // 如果用户名发生了变化，我们需要更新安全上下文中的主体
            // 并生成一个新令牌。
            String newJwt = jwtUtils.generateJwtToken(authentication); // 这将使用当前主体的用户名

            // 如果用户名本身已更新，上述令牌仍将包含旧用户名。
            // 我们需要确保Authentication对象在生成令牌之前反映*新*用户名。
            // 一种方法是使用updatedUser详细信息创建新的UserDetailsImpl。
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