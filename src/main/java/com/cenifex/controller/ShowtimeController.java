package com.cenifex.controller;

import com.cenifex.dto.TheaterShowtimesDTO;
import com.cenifex.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<TheaterShowtimesDTO>> getMovieShowtimes(
            @PathVariable Long movieId,
            @RequestParam(required = false) String date) {
        
        // If no date is provided, default to today
        LocalDate searchDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        
        List<TheaterShowtimesDTO> showtimes = showtimeService.getShowtimesForMovie(movieId, searchDate);
        return ResponseEntity.ok(showtimes);
    }
}
