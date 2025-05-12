package com.music.newnewmusic.controller;

import com.music.newnewmusic.model.Song;
import com.music.newnewmusic.service.SongService;
import com.music.newnewmusic.service.FavoriteSongService;
import com.music.newnewmusic.model.UserFavoriteSong;
import com.music.newnewmusic.security.UserDetailsImpl;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;
    private final FavoriteSongService favoriteSongService;

    @Autowired
    public SongController(SongService songService, FavoriteSongService favoriteSongService) {
        this.songService = songService;
        this.favoriteSongService = favoriteSongService;
    }

    @GetMapping
    public List<Song> getAllSongs() {
        return songService.getAllSongs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(@PathVariable String id) {
        Optional<Song> song = songService.getSongById(id);
        return song.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Song> addSong(@RequestBody Song song) {
        Song newSong = songService.addSong(song);
        return ResponseEntity.status(HttpStatus.CREATED).body(newSong);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Song> updateSong(@PathVariable String id, @RequestBody Song songDetails) {
        Song updatedSong = songService.updateSong(id, songDetails);
        if (updatedSong != null) {
            return ResponseEntity.ok(updatedSong);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable String id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/title")
    public List<Song> findSongsByTitle(@RequestParam String title) {
        return songService.findByTitle(title);
    }

    @GetMapping("/search/artist")
    public List<Song> findSongsByArtist(@RequestParam String artist) {
        return songService.findByArtist(artist);
    }

    @GetMapping("/search/album")
    public List<Song> findSongsByAlbum(@RequestParam String album) {
        return songService.findByAlbum(album);
    }

    @GetMapping("/search/genre")
    public List<Song> findSongsByGenre(@RequestParam String genre) {
        return songService.findByGenre(genre);
    }

    @GetMapping("/stream/{filename:.+}")
    public ResponseEntity<Resource> streamSong(@PathVariable String filename) {
        try {
            Path songFile = Paths.get("src/main/resources/music").resolve(filename);
            Resource resource = new UrlResource(songFile.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.parseMediaType("audio/mpeg"))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            // Consider logging the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            // Catch any other potential exceptions during file access
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{songId}/favorite")
    public ResponseEntity<?> addFavoriteSong(@PathVariable String songId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            UserFavoriteSong favoriteSong = favoriteSongService.addFavoriteSong(userDetails.getId(), songId);
            return ResponseEntity.ok(favoriteSong);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("收藏歌曲时发生错误");
        }
    }

    @DeleteMapping("/{songId}/favorite")
    public ResponseEntity<?> removeFavoriteSong(@PathVariable String songId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        favoriteSongService.removeFavoriteSong(userDetails.getId(), songId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteSongs(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        List<UserFavoriteSong> favoriteSongs = favoriteSongService.getFavoriteSongsByUserId(userDetails.getId());
        return ResponseEntity.ok(favoriteSongs);
    }

    @GetMapping("/{songId}/isFavorite")
    public ResponseEntity<Boolean> isSongFavorited(@PathVariable String songId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
             // Or handle as an error, depending on requirements
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
        boolean isFavorited = favoriteSongService.isSongFavorited(userDetails.getId(), songId);
        return ResponseEntity.ok(isFavorited);
    }
}