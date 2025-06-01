package com.music.newnewmusic.service;

import com.music.newnewmusic.model.User;
import com.music.newnewmusic.payload.request.PasswordUpdateRequest;
import com.music.newnewmusic.payload.request.ProfileUpdateRequest;
import com.music.newnewmusic.repository.SongRepository;
import com.music.newnewmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    SongRepository songRepository;

    @Transactional
    public User updateUserProfile(String userId, ProfileUpdateRequest profileUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("错误：用户未找到。"));

        if (!user.getUsername().equals(profileUpdateRequest.getUsername()) && userRepository.existsByUsername(profileUpdateRequest.getUsername())) {
            throw new RuntimeException("错误：用户名已被占用！");
        }
        if (!user.getEmail().equals(profileUpdateRequest.getEmail()) && userRepository.existsByEmail(profileUpdateRequest.getEmail())) {
            throw new RuntimeException("错误：邮箱已被使用！");
        }

        user.setUsername(profileUpdateRequest.getUsername());
        user.setEmail(profileUpdateRequest.getEmail());
        return userRepository.save(user);
    }

    @Transactional
    public void updateUserPassword(String userId, PasswordUpdateRequest passwordUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("错误：用户未找到。"));

        if (!passwordEncoder.matches(passwordUpdateRequest.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("错误：当前密码不正确。");
        }

        if (!passwordUpdateRequest.getNewPassword().equals(passwordUpdateRequest.getConfirmNewPassword())) {
            throw new RuntimeException("错误：新密码不匹配。");
        }

        user.setPassword(passwordEncoder.encode(passwordUpdateRequest.getNewPassword()));
        userRepository.save(user);
    }

}