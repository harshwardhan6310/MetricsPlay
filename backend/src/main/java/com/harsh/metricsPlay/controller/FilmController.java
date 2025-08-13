package com.harsh.metricsPlay.controller;

import com.harsh.metricsPlay.model.dto.CommentDTO;
import com.harsh.metricsPlay.model.dto.CommentReqDTO;
import com.harsh.metricsPlay.model.dto.FilmDTO;
import com.harsh.metricsPlay.service.FilmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/films")
public class FilmController {
    private final FilmService filmService;

    public FilmController(FilmService filmService) {
        this.filmService = filmService;
    }

    @GetMapping("/{filmId}")
    public ResponseEntity<FilmDTO> getFilm(@PathVariable Long filmId) {
        return ResponseEntity.ok(filmService.getFilmWithComments(filmId));
    }

    @PostMapping("/{filmId}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long filmId, @RequestBody CommentReqDTO req) {
        CommentDTO dto = filmService.addCommentToFilm(filmId, req.getContent(), req.getUsername());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{filmId}/stream")
    public ResponseEntity<String> streamFilm(@PathVariable Long filmId) {
        return ResponseEntity.ok("Streaming not implemented");
    }
}