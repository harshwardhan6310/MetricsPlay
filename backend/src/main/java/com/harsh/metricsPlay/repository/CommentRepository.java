package com.harsh.metricsPlay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.harsh.metricsPlay.model.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByFilmId(Long filmId);
}
