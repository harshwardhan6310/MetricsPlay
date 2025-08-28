package com.harsh.metricsPlay.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.harsh.metricsPlay.exception.DBAccessException;
import com.harsh.metricsPlay.exception.FilmNotFoundException;
import com.harsh.metricsPlay.exception.UserNotFoundException;
import com.harsh.metricsPlay.model.dto.CommentDTO;
import com.harsh.metricsPlay.model.dto.FilmDTO;
import com.harsh.metricsPlay.model.entity.Comment;
import com.harsh.metricsPlay.model.entity.Film;
import com.harsh.metricsPlay.model.entity.User;
import com.harsh.metricsPlay.repository.CommentRepository;
import com.harsh.metricsPlay.repository.FilmRepository;
import com.harsh.metricsPlay.repository.UserRepository;

import jakarta.persistence.PersistenceException;

@Service
public class FilmService {
    private final FilmRepository filmRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public FilmService(FilmRepository filmRepository, CommentRepository commentRepository, UserRepository userRepository) {
        this.filmRepository = filmRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional(readOnly = true)
    public FilmDTO getFilmWithComments(Long filmId) {
        try {
            Optional<Film> filmOpt = filmRepository.findById(filmId);

            if (filmOpt.isEmpty()) {
                throw new FilmNotFoundException(filmId);
            }

            Film film = filmOpt.get();
            
            List<Comment> comments = commentRepository.findByFilmId(filmId);

            List<CommentDTO> commentDTOs = new ArrayList<>();
            for (Comment comment : comments) {
                CommentDTO commentDTO = CommentDTO.builder()
                        .id(comment.getId())
                        .content(comment.getContent())
                        .username(comment.getUser().getUsername())
                        .build();
                commentDTOs.add(commentDTO);
            }

            return FilmDTO.builder()
                    .id(film.getId())
                    .title(film.getTitle())
                    .description(film.getDescription())
                    .comments(commentDTOs)
                    .videoUrl(film.getVideoUrl())
                    .genre(film.getGenre())
                    .build();

        } catch (DataAccessException | PersistenceException e) {
            throw new DBAccessException("An error occurred while fetching the film", e);
        }
    }

    @Transactional
    public CommentDTO addCommentToFilm(Long filmId, String content, String username) {
        try {
            Optional<Film> filmOpt = filmRepository.findById(filmId);
            if (filmOpt.isEmpty()) {
                throw new FilmNotFoundException(filmId);
            }
            Film film = filmOpt.get();
            Optional<User> userOpt = userRepository.findById(username);
            if (userOpt.isEmpty()) {
                throw new UserNotFoundException(username);
            }
            User user = userOpt.get();

            Comment comment = Comment.builder()
                    .film(film)
                    .user(user)
                    .content(content)
                    .build();

            Comment savedComment = commentRepository.save(comment);
            return CommentDTO.builder()
                    .id(savedComment.getId())
                    .content(savedComment.getContent())
                    .username(user.getUsername())
                    .createdAt(comment.getCreatedAt())
                    .build();

        } catch (DataAccessException | PersistenceException e) {
            throw new DBAccessException("An error occurred while adding the comment", e);
        }
    }
}
