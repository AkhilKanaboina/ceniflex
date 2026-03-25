package com.cenifex.service;

import com.cenifex.dto.ShowtimeDTO;
import com.cenifex.dto.TheaterShowtimesDTO;
import com.cenifex.entity.Showtime;
import com.cenifex.entity.Theater;
import com.cenifex.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShowtimeService {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    public List<TheaterShowtimesDTO> getShowtimesForMovie(Long movieId, LocalDate date) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdAndShowDateGreaterThanEqualOrderByShowDateAscStartTimeAsc(movieId, date);

        // Group showtimes by Theater
        Map<Theater, List<Showtime>> groupedByTheater = showtimes.stream()
                .collect(Collectors.groupingBy(s -> s.getScreen().getTheater()));

        List<TheaterShowtimesDTO> result = new ArrayList<>();

        for (Map.Entry<Theater, List<Showtime>> entry : groupedByTheater.entrySet()) {
            Theater theater = entry.getKey();
            
            List<ShowtimeDTO> dtoList = entry.getValue().stream()
                    .map(s -> new ShowtimeDTO(s.getId(), s.getStartTime(), s.getScreen().getName()))
                    .collect(Collectors.toList());

            result.add(new TheaterShowtimesDTO(
                    theater.getId(),
                    theater.getName(),
                    theater.getAddress(),
                    dtoList
            ));
        }

        return result;
    }
}
