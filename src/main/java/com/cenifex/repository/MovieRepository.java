package com.cenifex.repository;

import com.cenifex.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByLanguage(String language);
    List<Movie> findByGenreContainingIgnoreCase(String genre);
}
