package com.harsh.metricsPlay.repository;

import com.harsh.metricsPlay.model.entity.VideoEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VideoEventRepository extends JpaRepository<VideoEvent, Long> {
    
    List<VideoEvent> findByFilmIdAndUsernameOrderByTimestampDesc(Long filmId, String username);
    
    List<VideoEvent> findBySessionIdOrderByTimestampDesc(String sessionId);
    
    @Query("SELECT ve FROM VideoEvent ve WHERE ve.filmId = :filmId AND ve.timestamp >= :since")
    List<VideoEvent> findRecentEventsByFilm(@Param("filmId") Long filmId, @Param("since") LocalDateTime since);
    
    @Query("SELECT ve FROM VideoEvent ve WHERE ve.eventType = 'play' AND ve.timestamp >= :since")
    List<VideoEvent> findRecentPlayEvents(@Param("since") LocalDateTime since);
}