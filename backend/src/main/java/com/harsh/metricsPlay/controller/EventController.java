package com.harsh.metricsPlay.controller;

import com.harsh.metricsPlay.model.events.VideoEvent;
import com.harsh.metricsPlay.service.kafka.EventProducerService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@Slf4j
public class EventController {
    
    private final EventProducerService eventProducerService;
    
    public EventController(EventProducerService eventProducerService) {
        this.eventProducerService = eventProducerService;
    }
    
    @PostMapping("/video")
    public ResponseEntity<String> trackVideoEvent(@RequestBody VideoEvent event, HttpServletRequest request) {
        try {
            log.info("[API-GATEWAY] Received HTTP POST /api/events/video from IP: {}", 
                request.getRemoteAddr());
            log.info("[API-GATEWAY] Event details - Type: {}, Film: {}, User: {}, Session: {}", 
                event.getEventType(), event.getFilmId(), event.getUserId(), event.getSessionId());
            event.setTimestamp(java.time.LocalDateTime.now());
            log.info("[API-GATEWAY] Forwarding event to Kafka producer service");
            eventProducerService.sendVideoEvent(event);
            log.info("[API-GATEWAY] Event successfully forwarded to Kafka pipeline");
            return ResponseEntity.ok("Event tracked successfully");
            
        } catch (Exception e) {
            log.error("[API-GATEWAY] Error tracking video event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to track event");
        }
    }
}