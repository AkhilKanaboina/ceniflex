package com.cenifex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterShowtimesDTO {
    private Long theaterId;
    private String theaterName;
    private String address;
    private List<ShowtimeDTO> showtimes;
}
