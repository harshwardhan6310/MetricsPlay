package com.harsh.metricsPlay.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.harsh.metricsPlay.config.KafkaConfig;
import com.harsh.metricsPlay.model.events.VideoEvent;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LiveEventService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public LiveEventService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = KafkaConfig.VIDEO_EVENTS_TOPIC, groupId = "live-feed-group")
    public void consumeVideoEvents(VideoEvent event) {
        try {
            log.info("[LIVE-FEED] Received video event: {} for film {} by user {}", 
                    event.getEventType(), event.getFilmId(), event.getUserId());
            messagingTemplate.convertAndSend("/topic/live-events", event);
            log.debug("[LIVE-FEED] Event broadcasted to WebSocket clients");
        } catch (Exception e) {
            log.error("[LIVE-FEED] Error processing video event: {}", e.getMessage(), e);
        }
    }
}
