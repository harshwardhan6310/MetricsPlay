package com.harsh.metricsPlay.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoEventDTO {
    private String eventType;
    private Long filmId;
    private String username;
    private Double currentTime;
    private Double duration;
    private String sessionId;
    private String userAgent;
    private String ipAddress;
}