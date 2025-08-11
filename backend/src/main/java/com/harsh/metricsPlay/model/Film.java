package com.harsh.metricsPlay.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "films")
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Film {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    private String description;

    private String director;

    private String genre;

    @OneToMany(mappedBy = "film", cascade = CascadeType.ALL)
    private List<Comment> comments;

}
