package com.harsh.metricsPlay.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "viewing_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewingSession {
    @Id
    @Column(name = "session_id")
    private String sessionId; // Using sessionId as primary key
    
    @Column(name = "film_id", nullable = false)
    private Long filmId;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "total_watch_time")
    private Double totalWatchTime; // Actual time watched in seconds
    
    @Column(name = "retention_rate")
    private Double retentionRate; // % of video watched
    
    @Column(name = "is_completed") 
    private Boolean completed = false;
    
    @Column(name = "last_position")
    private Double lastPosition; // Last known position in video
}