package com.harsh.metricsPlay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.harsh.metricsPlay.model.entity.Film;

@Repository
public interface FilmRepository extends JpaRepository<Film, Long> {
    List<Film> findByGenre(String genre);
    List<Film> findByDirector(String director);
}
