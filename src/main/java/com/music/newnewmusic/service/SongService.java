package com.music.newnewmusic.service;

import com.music.newnewmusic.model.Song;
import com.music.newnewmusic.repository.SongRepository;
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

@Service
public class SongService {

    private final SongRepository songRepository;
    private final Path fileStorageLocation; // Added for file storage path

    @Autowired
    public SongService(SongRepository songRepository, @Value("${file.upload-dir:./uploads/songs}") String uploadDir) { 
        this.songRepository = songRepository;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
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
        return songRepository.findByArtistContainingIgnoreCase(artist);
    }

    public List<Song> findByAlbum(String album) {
        return songRepository.findByAlbumContainingIgnoreCase(album);
    }

    public List<Song> findByGenre(String genre) {
        return songRepository.findByGenreContainingIgnoreCase(genre);
    }

    public Song storeSong(String title, String artist, String album, String genre, MultipartFile file) throws IOException {
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

            Song newSong = new Song(title, artist, album, genre, null, fileName, null); 
            
            return songRepository.save(newSong);
        } catch (IOException ex) {
            throw new IOException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Path loadSongFile(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }
}