package com.harsh.metricsPlay.service.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import com.harsh.metricsPlay.config.KafkaConfig;
import com.harsh.metricsPlay.model.events.VideoEventDTO;
import com.harsh.metricsPlay.service.analytics.RealTimeAnalyticsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventConsumerService {

    private final RealTimeAnalyticsService analyticsService;

    @KafkaListener(topics = KafkaConfig.VIDEO_EVENTS_TOPIC, groupId = "video-events-processor")
    public void processVideoEvent(@Payload VideoEventDTO event,
                                @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                                @Header(KafkaHeaders.OFFSET) long offset,
                                Acknowledgment acknowledgment) {
        try {
            log.info("[KAFKA-CONSUMER] Received video event from topic: {}, partition: {}, offset: {} with details : {}", 
                    topic, partition, offset, event);
            switch (event.getEventType().toLowerCase()) {
                case "play":
                    log.info("[KAFKA-CONSUMER] Routing PLAY event to analytics service");
                    analyticsService.handlePlayEvent(event);
                    break;
                case "pause":
                    log.info("[KAFKA-CONSUMER] Routing PAUSE event to analytics service");
                    analyticsService.handlePauseEvent(event);
                    break;
                case "ended":
                    log.info("[KAFKA-CONSUMER] Routing ENDED event to analytics service");
                    analyticsService.handleEndedEvent(event);
                    break;
                case "progress":
                    log.info("[KAFKA-CONSUMER] Routing PROGRESS event to analytics service");
                    analyticsService.handleProgressEvent(event);
                    break;
                default:
                    log.debug("[KAFKA-CONSUMER] Ignoring {} event (not relevant for viewer tracking)", event.getEventType());
                    break;
            }

            acknowledgment.acknowledge();
            log.info("[KAFKA-CONSUMER] Video event processed successfully at offset: {}", offset);

        } catch (Exception e) {
            log.error("[KAFKA-CONSUMER] Error processing video event at offset {}: {}", offset, e.getMessage(), e);
            acknowledgment.acknowledge();
        }
    }
}
