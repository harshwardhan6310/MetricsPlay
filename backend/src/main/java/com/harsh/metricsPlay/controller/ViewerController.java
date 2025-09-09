package com.harsh.metricsPlay.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.harsh.metricsPlay.service.analytics.RealTimeAnalyticsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/viewers")
@RequiredArgsConstructor
@Slf4j
public class ViewerController {

    private final RealTimeAnalyticsService analyticsService;

    @GetMapping("/film/{filmId}/count")
    public ResponseEntity<Map<String, Object>> getViewerCount(@PathVariable Long filmId) {
        try {
            Long viewerCount = analyticsService.getConcurrentViewers(filmId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("filmId", filmId);
            response.put("viewerCount", viewerCount);
            response.put("timestamp", System.currentTimeMillis());
            
            log.info("[VIEWER-API] Film {} has {} concurrent viewers", filmId, viewerCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting viewer count for film {}: {}", filmId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
