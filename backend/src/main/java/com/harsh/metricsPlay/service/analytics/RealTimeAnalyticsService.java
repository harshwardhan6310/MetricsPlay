package com.harsh.metricsPlay.service.analytics;

import com.harsh.metricsPlay.model.events.VideoEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeAnalyticsService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String CONCURRENT_VIEWERS_KEY = "concurrent_viewers";

    public void handlePlayEvent(VideoEvent event) {
        log.info("[VIEWERS] User {} started watching film {}", event.getUserId(), event.getFilmId());
        String viewersKey = CONCURRENT_VIEWERS_KEY + ":" + event.getFilmId();
        redisTemplate.opsForSet().add(viewersKey, event.getUserId());
        redisTemplate.expire(viewersKey, 5, TimeUnit.MINUTES);
        broadcastViewerCount(event.getFilmId());
        log.info("[VIEWERS] Added user {} to viewers of film {}", event.getUserId(), event.getFilmId());
    }

    public void handleStopEvent(VideoEvent event) {
        log.info("[VIEWERS] User {} stopped watching film {}", event.getUserId(), event.getFilmId());
        String viewersKey = CONCURRENT_VIEWERS_KEY + ":" + event.getFilmId();
        redisTemplate.opsForSet().remove(viewersKey, event.getUserId());
        broadcastViewerCount(event.getFilmId());
        log.info("[VIEWERS] Removed user {} from viewers of film {}", event.getUserId(), event.getFilmId());
    }

    public void handleProgressEvent(VideoEvent event) {
        log.info("[VIEWERS] User {} watching film {}", event.getUserId(), event.getFilmId());
        String viewersKey = CONCURRENT_VIEWERS_KEY + ":" + event.getFilmId();
        redisTemplate.opsForSet().add(viewersKey, event.getUserId());
        redisTemplate.expire(viewersKey, 5, TimeUnit.MINUTES);
        broadcastViewerCount(event.getFilmId());
        log.info("[VIEWERS] User {} viewing activity token refreshed for film {}", event.getUserId(), event.getFilmId());
    }

    public void handlePauseEvent(VideoEvent event) {
        handleStopEvent(event);
    }

    public void handleEndedEvent(VideoEvent event) {
        handleStopEvent(event);
    }

    public Long getConcurrentViewers(Long filmId) {
        String viewersKey = CONCURRENT_VIEWERS_KEY + ":" + filmId;
        Long count = redisTemplate.opsForSet().size(viewersKey);
        return count != null ? count : 0L;
    }

    private void broadcastViewerCount(Long filmId) {
        Long viewerCount = getConcurrentViewers(filmId);
        
        // Create update message
        Map<String, Object> update = new HashMap<>();
        update.put("type", "concurrent_viewers");
        update.put("filmId", filmId);
        update.put("count", viewerCount);
        update.put("timestamp", LocalDateTime.now());
        
        // Also broadcast to video player concurrent viewers 
        messagingTemplate.convertAndSend("/topic/real-time-analytics", update);

        broadcastTotalViewers();
    }

    private void broadcastTotalViewers() {
        Long totalViewers = 0L;
        for(int i=1 ; i<=5 ; i++){ // Assuming film IDs range from 1 to 5 for now :D
            totalViewers += getConcurrentViewers((long)i);
        }
        Map<String, Object> update = new HashMap<>();
        update.put("type", "total_viewers");
        update.put("count", totalViewers);
        update.put("timestamp", LocalDateTime.now());

        // Broadcast total viewers to dashboard
        messagingTemplate.convertAndSend("/topic/real-time-analytics", update);
    }
}
