package com.harsh.metricsPlay.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "event_type", nullable = false)
    private String eventType; // "play", "pause", "seek", "ended", "progress"
    
    @Column(name = "film_id", nullable = false)
    private Long filmId;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "video_current_time") 
    private Double currentTime; // Video timestamp in seconds
    
    @Column(name = "video_duration") 
    private Double duration; // Total video duration
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Column(name = "event_timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "ip_address")
    private String ipAddress;
}