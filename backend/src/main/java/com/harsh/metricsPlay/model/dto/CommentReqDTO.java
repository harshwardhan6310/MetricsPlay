package com.harsh.metricsPlay.model.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CommentReqDTO {
    @NotBlank
    private Long filmId;

    @NotBlank
    private String username;
    
    @NotBlank 
    private String content;
}