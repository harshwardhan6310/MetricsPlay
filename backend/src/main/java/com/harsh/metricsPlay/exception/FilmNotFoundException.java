package com.harsh.metricsPlay.exception;

public class FilmNotFoundException extends RuntimeException {
    public FilmNotFoundException(Long filmId) {
        super("Film not found with id: " + filmId);
    }

    public FilmNotFoundException(String message) {
        super(message);
    }
    
}
