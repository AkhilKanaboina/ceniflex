package com.cenifex.repository;

import com.cenifex.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieIdAndShowDateGreaterThanEqualOrderByShowDateAscStartTimeAsc(Long movieId, LocalDate showDate);
}
