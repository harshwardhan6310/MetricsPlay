package com.harsh.metricsPlay.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.harsh.metricsPlay.model.dto.FilmDTO;
import com.harsh.metricsPlay.model.dto.VideoStreamDTO;
import com.harsh.metricsPlay.service.FilmService;
import com.harsh.metricsPlay.service.StreamingService;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/films")
@Slf4j
public class FilmController {
    private final FilmService filmService;
    private final StreamingService streamingService;

    public FilmController(FilmService filmService, StreamingService streamingService) {
        this.filmService = filmService;
        this.streamingService = streamingService;
    }

    @GetMapping
    public ResponseEntity<List<FilmDTO>> getAllFilms() {
        List<FilmDTO> films = filmService.getAllFilms();
        return ResponseEntity.ok(films);
    }

    @GetMapping("/{filmId}")
    public ResponseEntity<FilmDTO> getFilm(@PathVariable Long filmId) {
        return ResponseEntity.ok(filmService.getFilm(filmId));
    }

    @GetMapping("/{filmId}/stream")
    public ResponseEntity<byte[]> streamFilm(@PathVariable Long filmId, @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            log.info("Streaming request for film ID: {} with Range: {}", filmId, rangeHeader);
            // Get film details
            FilmDTO film = filmService.getFilm(filmId);
            log.info("Found film: {} with video file: {}", film.getTitle(), film.getVideoUrl());
            String videoFilename = film.getVideoUrl();
            VideoStreamDTO streamResponse = this.streamingService.getFilmChunk(videoFilename, rangeHeader);
            if (streamResponse == null) {
                log.error("No stream response for film ID: {}, video file: {}", filmId, videoFilename);
                return ResponseEntity.notFound().build();
            }

            log.info("Streaming {} bytes ({}-{}/{}) for film: {}", 
                streamResponse.getContentLength(), 
                streamResponse.getStart(), 
                streamResponse.getEnd(), 
                streamResponse.getFileSize(),
                film.getTitle());

            HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Type", "video/mp4");
                headers.add("Accept-Ranges", "bytes");
                headers.add("Content-Length", String.valueOf(streamResponse.getContentLength()));
                
            // Only add Content-Range if it's a range request
            if (rangeHeader != null) {
                headers.add("Content-Range", "bytes " + streamResponse.getStart() + "-" + streamResponse.getEnd() + "/" + streamResponse.getFileSize());
            }
            HttpStatus status = rangeHeader != null ? HttpStatus.PARTIAL_CONTENT : HttpStatus.OK;
            return new ResponseEntity<>(streamResponse.getData(), headers, status);
        }catch (Exception e) {
            log.error("Error streaming film {}: {}", filmId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}