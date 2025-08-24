package com.harsh.metricsPlay.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoStreamDTO {
    private byte[] data;
    private long start;
    private long end;
    private long fileSize;
    private long contentLength;
}