package com.harsh.metricsPlay.service.kafka;

import com.harsh.metricsPlay.config.KafkaConfig;
import com.harsh.metricsPlay.model.events.VideoEventDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendVideoEvent(VideoEventDTO event) {
        try {
            log.info("[KAFKA-PRODUCER] Preparing to send {} event to Kafka topic: {}", 
                event.getEventType(), KafkaConfig.VIDEO_EVENTS_TOPIC);
            log.debug("[KAFKA-PRODUCER] Event payload - Film: {}, User: {}, Session: {}, Time: {}s", 
                event.getFilmId(), event.getUserId(), event.getSessionId(), event.getCurrentTime());
            
            String key = generateVideoEventKey(event);
            log.debug("[KAFKA-PRODUCER] Generated event key: {}", key);
            
            CompletableFuture<SendResult<String, Object>> future = 
                kafkaTemplate.send(KafkaConfig.VIDEO_EVENTS_TOPIC, key, event);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("[KAFKA-PRODUCER] Video event {} sent successfully to partition {} with offset: {}", 
                             event.getEventType(), 
                             result.getRecordMetadata().partition(),
                             result.getRecordMetadata().offset());
                } else {
                    log.error("[KAFKA-PRODUCER] Failed to send video event: {}", event.getEventType(), ex);
                }
            });
        } catch (Exception e) {
            log.error("[KAFKA-PRODUCER] Error sending video event", e);
        }
    }

    private String generateVideoEventKey(VideoEventDTO event) {
        return String.format("%s_%s_%s", event.getUserId(), event.getFilmId(), event.getSessionId());
    }
}
