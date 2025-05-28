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
    private final UserRepository userRepository; // Added for recommendation
    private final Path fileStorageLocation; // Added for file storage path
    private final MongoTemplate mongoTemplate;

    public SongService(SongRepository songRepository, UserRepository userRepository, MongoTemplate mongoTemplate) {
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
        // Updated to point to the user-specified music directory
        this.fileStorageLocation = Paths.get("src/main/resources/music")
                .toAbsolutePath().normalize();
        try {
            // Ensure the directory exists, though for src/main/resources it usually does
            if (!Files.exists(this.fileStorageLocation)) {
                 Files.createDirectories(this.fileStorageLocation);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Could not create or access the directory where the music files are stored.", ex);
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
            // Assuming songDetails.getArtist() now returns List<String>
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
        // Assuming this method now searches if the artist is in the list of artists for a song
        return songRepository.findByArtist(artist);
    }

    public List<Song> findByAlbum(String album) {
        return songRepository.findByAlbumContainingIgnoreCase(album);
    }

    public List<Song> findByGenre(String genre) {
        return songRepository.findByGenreContainingIgnoreCase(genre);
    }

    public Song storeSong(String title, List<String> artists, String album, String genre, MultipartFile file) throws IOException {
        // Normalize file name
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new IllegalArgumentException("Song file name cannot be null");
        }
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");

        try {
            if(fileName.contains("..")) {
                throw new IllegalArgumentException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Song newSong = new Song(title, artists, album, genre, null, fileName, null); 
            
            return songRepository.save(newSong);
        } catch (IOException ex) {
            throw new IOException("Could not store file " + fileName + ". Please try again!", ex);
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
                throw new RuntimeException("Could not read the file: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Error: " + ex.getMessage());
        }
    }

    public List<Song> getRecommendedSongs(String userId) {
        User user = userRepository.findByUsername(userId).orElse(null);
        if (user == null || user.getFavoriteSongIds() == null || user.getFavoriteSongIds().isEmpty()) {
            // If user has no favorites, return a list of popular or random songs (e.g., first 10 songs)
            // For simplicity, returning first 10 songs, or an empty list if less than 10 songs exist
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
                                                 .flatMap(song -> song.getArtist().stream()) // Flatten the list of artists
                                                 .filter(artist -> artist != null && !artist.isEmpty())
                                                 .collect(Collectors.toSet());

        List<Song> recommendedSongs = songRepository.findAll().stream()
                .filter(song -> !favoriteSongIds.contains(song.getId())) // Exclude already favorited songs
                .filter(song -> (song.getGenre() != null && favoriteGenres.contains(song.getGenre())) || 
                               (song.getArtist() != null && !Collections.disjoint(song.getArtist(), favoriteArtists)))
                .limit(10) // Limit to 10 recommendations
                .collect(Collectors.toList());
        
        // If not enough recommendations, fill with some popular/random songs (excluding favorites)
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