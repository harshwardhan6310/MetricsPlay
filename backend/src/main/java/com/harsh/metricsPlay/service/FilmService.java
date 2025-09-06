package com.harsh.metricsPlay.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.harsh.metricsPlay.exception.DBAccessException;
import com.harsh.metricsPlay.exception.FilmNotFoundException;
import com.harsh.metricsPlay.model.dto.FilmDTO;
import com.harsh.metricsPlay.model.entity.Film;
import com.harsh.metricsPlay.repository.FilmRepository;

import jakarta.persistence.PersistenceException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FilmService {
    private final FilmRepository filmRepository;

    public FilmService(FilmRepository filmRepository) {
        this.filmRepository = filmRepository;
    }
    
    @Transactional(readOnly = true)
    public FilmDTO getFilm(Long filmId) {
        try {
            log.info("[DATABASE] Fetching film details for ID: {}", filmId);
            Optional<Film> filmOpt = filmRepository.findById(filmId);

            if (filmOpt.isEmpty()) {
                log.warn("[DATABASE] Film not found with ID: {}", filmId);
                throw new FilmNotFoundException(filmId);
            }

            Film film = filmOpt.get();
            log.info("[DATABASE] Film found: {} ({})", film.getTitle(), filmId);

            return FilmDTO.builder()
                    .id(film.getId())
                    .title(film.getTitle())
                    .description(film.getDescription())
                    .videoUrl(film.getVideoUrl())
                    .genre(film.getGenre())
                    .duration(film.getDuration())
                    .build();

        } catch (DataAccessException | PersistenceException e) {
            throw new DBAccessException("An error occurred while fetching the film", e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<FilmDTO> getAllFilms() {
        try {
            List<Film> films = filmRepository.findAll();
            List<FilmDTO> filmDTOs = new ArrayList<>();
            
            for (Film film : films) {
                filmDTOs.add(FilmDTO.builder()
                        .id(film.getId())
                        .title(film.getTitle())
                        .description(film.getDescription())
                        .videoUrl(film.getVideoUrl())
                        .genre(film.getGenre())
                        .duration(film.getDuration())
                        .build());
            }
            
            return filmDTOs;
        } catch (DataAccessException | PersistenceException e) {
            throw new DBAccessException("An error occurred while fetching all films", e);
        }
    }
}
