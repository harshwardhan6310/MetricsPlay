package com.harsh.metricsPlay.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.harsh.metricsPlay.model.dto.VideoEventDTO;
import com.harsh.metricsPlay.model.entity.VideoEvent;
import com.harsh.metricsPlay.model.entity.ViewingSession;
import com.harsh.metricsPlay.repository.VideoEventRepository;
import com.harsh.metricsPlay.repository.ViewingSessionRepository;
import com.harsh.metricsPlay.service.kafka.EventProducerService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EventTrackingService {
    
    private final VideoEventRepository eventRepository;
    private final ViewingSessionRepository sessionRepository;
    private final EventProducerService eventProducerService;
    
    public EventTrackingService(VideoEventRepository eventRepository, 
                              ViewingSessionRepository sessionRepository,
                              EventProducerService eventProducerService) {
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
        this.eventProducerService = eventProducerService;
    }
    
    @Transactional
    public void trackVideoEvent(VideoEventDTO eventDTO) {
        try {
            // Save the event to database
            VideoEvent event = VideoEvent.builder()
                .eventType(eventDTO.getEventType())
                .filmId(eventDTO.getFilmId())
                .username(eventDTO.getUsername())
                .currentTime(eventDTO.getCurrentTime())
                .duration(eventDTO.getDuration())
                .sessionId(eventDTO.getSessionId())
                .timestamp(LocalDateTime.now())
                .userAgent(eventDTO.getUserAgent())
                .ipAddress(eventDTO.getIpAddress())
                .build();
            
            eventRepository.save(event);
            log.info("Saved video event: {} for film {} at position {}", 
                eventDTO.getEventType(), eventDTO.getFilmId(), eventDTO.getCurrentTime());
            
            // Create Kafka video event
            com.harsh.metricsPlay.model.events.VideoEvent kafkaEvent = new com.harsh.metricsPlay.model.events.VideoEvent();
            kafkaEvent.setEventId(UUID.randomUUID().toString());
            kafkaEvent.setSessionId(eventDTO.getSessionId());
            kafkaEvent.setUserId(eventDTO.getUsername());
            kafkaEvent.setFilmId(eventDTO.getFilmId());
            kafkaEvent.setEventType(eventDTO.getEventType());
            kafkaEvent.setTimestamp(LocalDateTime.now());
            kafkaEvent.setCurrentTime(eventDTO.getCurrentTime());
            eventProducerService.sendVideoEvent(kafkaEvent);
            updateViewingSession(eventDTO);
            
        } catch (Exception e) {
            log.error("Error tracking video event: {}", e.getMessage(), e);
        }
    }
    
    private void updateViewingSession(VideoEventDTO eventDTO) {
        Optional<ViewingSession> existingSession = sessionRepository.findById(eventDTO.getSessionId());
        ViewingSession session;
        
        if (existingSession.isPresent()) {
            session = existingSession.get();
        } else {
            session = ViewingSession.builder()
                .sessionId(eventDTO.getSessionId())
                .filmId(eventDTO.getFilmId())
                .username(eventDTO.getUsername())
                .startTime(LocalDateTime.now())
                .totalWatchTime(0.0)
                .completed(false)
                .build();
        }
        
        switch (eventDTO.getEventType().toLowerCase()) {
            case "play":
                if (session.getStartTime() == null) {
                    session.setStartTime(LocalDateTime.now());
                }
                break;
                
            case "pause":
                session.setLastPosition(eventDTO.getCurrentTime());
                break;
                
            case "ended":
                session.setCompleted(true);
                session.setEndTime(LocalDateTime.now());
                session.setLastPosition(eventDTO.getCurrentTime());
                if (eventDTO.getDuration() != null && eventDTO.getDuration() > 0) {
                    session.setRetentionRate((eventDTO.getCurrentTime() / eventDTO.getDuration()) * 100);
                }
                break;
                
            case "seek":
                session.setLastPosition(eventDTO.getCurrentTime());
                break;
                
            case "progress":
                session.setLastPosition(eventDTO.getCurrentTime());
                break;
        }
        
        sessionRepository.save(session);
        log.debug("Updated viewing session: {}", session.getSessionId());
    }
}