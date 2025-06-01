package com.music.newnewmusic.service;

import com.music.newnewmusic.model.Song;
import com.music.newnewmusic.repository.SongRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.io.IOException;
import java.net.MalformedURLException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import com.music.newnewmusic.model.User;
import com.music.newnewmusic.repository.UserRepository;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class SongService {

    private final SongRepository songRepository;
    private final UserRepository userRepository; // 为推荐功能添加
    private final Path fileStorageLocation; // 为文件存储路径添加
    private final MongoTemplate mongoTemplate;

    public SongService(SongRepository songRepository, UserRepository userRepository, MongoTemplate mongoTemplate) {
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
        // 更新为指向用户指定的音乐目录
        this.fileStorageLocation = Paths.get("src/main/resources/music")
                .toAbsolutePath().normalize();
        try {
            // 确保目录存在，尽管对于src/main/resources通常已存在
            if (!Files.exists(this.fileStorageLocation)) {
                 Files.createDirectories(this.fileStorageLocation);
            }
        } catch (Exception ex) {
            throw new RuntimeException("无法创建或访问存储音乐文件的目录。", ex);
        }
    }

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Optional<Song> getSongById(String id) {
        return songRepository.findById(id);
    }

    public Song addSong(Song song) {
        return songRepository.save(song);
    }

    public Song updateSong(String id, Song songDetails) {
        return songRepository.findById(id).map(song -> {
            song.setTitle(songDetails.getTitle());
            // 假设songDetails.getArtist()现在返回List<String>
            song.setArtist(songDetails.getArtist()); 
            song.setAlbum(songDetails.getAlbum());
            song.setGenre(songDetails.getGenre());
            song.setDuration(songDetails.getDuration());
            song.setFilePath(songDetails.getFilePath());
            song.setCoverArtPath(songDetails.getCoverArtPath());
            return songRepository.save(song);
        }).orElse(null); 
    }

    public void deleteSong(String id) {
        songRepository.deleteById(id);
    }

    public List<Song> findByTitle(String title) {
        return songRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Song> findByArtist(String artist) {
        // 假设此方法现在搜索艺术家是否在歌曲的艺术家列表中
        return songRepository.findByArtist(artist);
    }

    public List<Song> findByAlbum(String album) {
        return songRepository.findByAlbumContainingIgnoreCase(album);
    }

    public List<Song> findByGenre(String genre) {
        return songRepository.findByGenreContainingIgnoreCase(genre);
    }

    public Song storeSong(String title, List<String> artists, String album, String genre, MultipartFile file) throws IOException {
        // 规范化文件名
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new IllegalArgumentException("歌曲文件名不能为空");
        }
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");

        try {
            if(fileName.contains("..")) {
                throw new IllegalArgumentException("抱歉！文件名包含无效的路径序列 " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Song newSong = new Song(title, artists, album, genre, null, fileName, null); 
            
            return songRepository.save(newSong);
        } catch (IOException ex) {
            throw new IOException("无法存储文件 " + fileName + "。请重试！", ex);
        }
    }

    public Path loadSongFile(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }

    public Resource loadSongAsResource(String fileName) throws MalformedURLException {
        try {
            Path filePath = loadSongFile(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("无法读取文件：" + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("错误：" + ex.getMessage());
        }
    }

    public List<Song> getRecommendedSongs(String userId) {
        User user = userRepository.findByUsername(userId).orElse(null);
        if (user == null || user.getFavoriteSongIds() == null || user.getFavoriteSongIds().isEmpty()) {
            // 如果用户没有收藏，返回热门或随机歌曲列表（例如，前10首歌曲）
            // 为简单起见，返回前10首歌曲，如果少于10首歌曲则返回空列表
            List<Song> allSongs = songRepository.findAll();
            return allSongs.size() > 10 ? allSongs.subList(0, 10) : allSongs;
        }

        List<String> favoriteSongIds = new java.util.ArrayList<>(user.getFavoriteSongIds());
        List<Song> favoriteSongs = songRepository.findAllById(favoriteSongIds);

        Set<String> favoriteGenres = favoriteSongs.stream()
                                                .map(Song::getGenre)
                                                .filter(genre -> genre != null && !genre.isEmpty())
                                                .collect(Collectors.toSet());

        Set<String> favoriteArtists = favoriteSongs.stream()
                                                 .flatMap(song -> song.getArtist().stream()) // 展平艺术家列表
                                                 .filter(artist -> artist != null && !artist.isEmpty())
                                                 .collect(Collectors.toSet());

        List<Song> recommendedSongs = songRepository.findAll().stream()
                .filter(song -> !favoriteSongIds.contains(song.getId())) // 排除已收藏的歌曲
                .filter(song -> (song.getGenre() != null && favoriteGenres.contains(song.getGenre())) || 
                               (song.getArtist() != null && !Collections.disjoint(song.getArtist(), favoriteArtists)))
                .limit(10) // 限制为10个推荐
                .collect(Collectors.toList());
        
        // 如果推荐不够，用一些热门/随机歌曲填充（排除收藏）
        if (recommendedSongs.size() < 10) {
            List<Song> additionalSongs = songRepository.findAll().stream()
                .filter(song -> !favoriteSongIds.contains(song.getId()) && !recommendedSongs.contains(song))
                .limit(10 - recommendedSongs.size())
                .collect(Collectors.toList());
            recommendedSongs.addAll(additionalSongs);
        }

        return recommendedSongs;
    }
}