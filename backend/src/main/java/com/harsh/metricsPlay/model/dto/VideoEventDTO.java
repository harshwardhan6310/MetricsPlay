package com.harsh.metricsPlay.model.events;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.time.LocalDateTime;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class VideoEventDTO {
    @JsonProperty("eventId")
    private String eventId;
    
    @JsonProperty("sessionId")
    private String sessionId;
    
    @JsonProperty("userId")
    private String userId;
    
    @JsonProperty("filmId")
    private Long filmId;
    
    @JsonProperty("eventType")
    private String eventType; // play, pause, seek, progress, ended, loaded
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("currentTime")
    private Double currentTime;
}
