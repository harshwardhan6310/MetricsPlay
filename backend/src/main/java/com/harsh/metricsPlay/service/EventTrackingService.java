package com.harsh.metricsPlay.service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.harsh.metricsPlay.model.entity.VideoEvent;
import com.harsh.metricsPlay.model.entity.ViewingSession;
import com.harsh.metricsPlay.model.events.VideoEventDTO;
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
    public void trackVideoEvent(VideoEventDTO incoming) {
        try {
            if (incoming == null) {
                log.warn("trackVideoEvent called with null event");
                return;
            }

            // Build JPA entity from incoming event
            VideoEvent entity = VideoEvent.builder()
                .eventType(incoming.getEventType())
                .filmId(incoming.getFilmId())
                .username(incoming.getUserId())
                .currentTime(incoming.getCurrentTime())
                .sessionId(incoming.getSessionId())
                .timestamp(incoming.getTimestamp() != null ? incoming.getTimestamp() : LocalDateTime.now())
                .build();

            eventRepository.save(entity);
            log.info("[EVENT-TRACKING] Saved event type={} filmId={} user={} t={}",
                entity.getEventType(), entity.getFilmId(), entity.getUsername(), entity.getCurrentTime());

            // Update session state
            updateViewingSession(incoming);
        } catch (Exception e) {
            log.error("[EVENT-TRACKING] Error persisting event: {}", e.getMessage(), e);
        }
    }

    // Update or create viewing session based on the incoming event
    private void updateViewingSession(VideoEventDTO incoming) {
        try {
            Optional<ViewingSession> existing = sessionRepository.findById(incoming.getSessionId());
            ViewingSession session = existing.orElseGet(() -> ViewingSession.builder()
                .sessionId(incoming.getSessionId())
                .filmId(incoming.getFilmId())
                .username(incoming.getUserId())
                .startTime(LocalDateTime.now())
                .totalWatchTime(0.0)
                .completed(false)
                .lastPosition(0.0)
                .build()
            );

            String type = incoming.getEventType() != null ? incoming.getEventType().toLowerCase(Locale.ROOT) : "";
            Double position = incoming.getCurrentTime();

            switch (type) {
                case "play":
                    if (session.getStartTime() == null) {
                        session.setStartTime(LocalDateTime.now());
                    }
                    break;
                case "pause":
                case "seek":
                case "progress":
                    if (position != null) {
                        session.setLastPosition(position);
                    }
                    break;
                case "ended":
                    session.setCompleted(true);
                    session.setEndTime(LocalDateTime.now());
                    if (position != null) {
                        session.setLastPosition(position);
                    }
                    break;
                default:
                    if (position != null) {
                        session.setLastPosition(position);
                    }
            }
            sessionRepository.save(session);
            log.debug("[EVENT-TRACKING] Updated session {} for user={} film={} pos={}",
                session.getSessionId(), session.getUsername(), session.getFilmId(), session.getLastPosition());
        } catch (Exception e) {
            log.error("[EVENT-TRACKING] Error updating session: {}", e.getMessage(), e);
        }
    }
}