package com.harsh.metricsPlay.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    private Long filmId;

    @NotBlank
    private String username;
    
    @NotBlank 
    private String content;
}