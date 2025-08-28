package com.harsh.metricsPlay.controller;

import com.harsh.metricsPlay.model.dto.VideoEventDTO;
import com.harsh.metricsPlay.service.EventTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@Slf4j
public class EventController {
    
    private final EventTrackingService eventTrackingService;
    
    public EventController(EventTrackingService eventTrackingService) {
        this.eventTrackingService = eventTrackingService;
    }
    
    @PostMapping("/video")
    public ResponseEntity<String> trackVideoEvent(@RequestBody VideoEventDTO event, HttpServletRequest request) {
        try {
            event.setIpAddress(getClientIP(request));
            event.setUserAgent(request.getHeader("User-Agent"));
            
            log.info("Received {} event for film {} from user {} at time {}", 
                event.getEventType(), event.getFilmId(), event.getUsername(), event.getCurrentTime());
            
            eventTrackingService.trackVideoEvent(event);
            return ResponseEntity.ok("Event tracked successfully");
            
        } catch (Exception e) {
            log.error("Error tracking video event: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to track event");
        }
    }
    
    @GetMapping("/active-viewers/{filmId}")
    public ResponseEntity<Long> getActiveViewers(@PathVariable Long filmId) {
        Long count = eventTrackingService.getActiveViewersCount(filmId);
        return ResponseEntity.ok(count);
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}