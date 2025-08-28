package com.harsh.metricsPlay.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.harsh.metricsPlay.model.entity.ViewingSession;

@Repository
public interface ViewingSessionRepository extends JpaRepository<ViewingSession, String> {
    
    List<ViewingSession> findByFilmIdOrderByStartTimeDesc(Long filmId);
    
    List<ViewingSession> findByUsernameOrderByStartTimeDesc(String username);
    
    @Query("SELECT vs FROM ViewingSession vs WHERE vs.endTime IS NULL AND vs.startTime >= :since")
    List<ViewingSession> findActiveSessions(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(vs) FROM ViewingSession vs WHERE vs.filmId = :filmId AND vs.startTime >= :since")
    Long countRecentViewsByFilm(@Param("filmId") Long filmId, @Param("since") LocalDateTime since);
}