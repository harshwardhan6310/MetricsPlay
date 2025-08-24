package com.harsh.metricsPlay.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.harsh.metricsPlay.model.dto.VideoStreamDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StreamingService {
    
    private final ResourceLoader resourceLoader;
    private final String VIDEO_PATH = "/app/videos/";

    public StreamingService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public Resource getVideo(String filename) {
        log.debug("Fetching video resource: {}", "file:" + VIDEO_PATH + filename);
        return resourceLoader.getResource("file:" + VIDEO_PATH + filename);
    }

    public byte[] readByteRange(String filename, long start, long end) throws IOException {
        Path path = Paths.get(VIDEO_PATH + filename);
        try (InputStream inputStream = Files.newInputStream(path)) {
            inputStream.skip(start);
            long contentLength = end - start + 1;
            return inputStream.readNBytes((int) contentLength);
        }
    }

    public VideoStreamDTO getFilmChunk(String videoFilename, String rangeHeader) {
        try {
            Resource videoResource = getVideo(videoFilename);
            if (videoResource.exists()) {
                log.debug("Resource exists ! {}", videoFilename);
                long fileSize = videoResource.contentLength();
                long start = 0;
                long end = fileSize - 1;

                if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                    String[] ranges = rangeHeader.substring(6).split("-");
                    start = Long.parseLong(ranges[0]);
                    if (ranges.length > 1 && !ranges[1].isEmpty()) {
                        end = Long.parseLong(ranges[1]);
                    }
                    end = Math.min(end, fileSize - 1);
                }
                return VideoStreamDTO.builder()
                        .data(readByteRange(videoFilename, start, end))
                        .start(start)
                        .end(end)
                        .fileSize(fileSize)
                        .contentLength(end - start + 1)
                        .build();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

}
