package com.harsh.metricsPlay.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FilmDTO {
    private Long id;
    private String title;
    private String description;
    private String genre;
    private String videoUrl;
    private String duration;
}
