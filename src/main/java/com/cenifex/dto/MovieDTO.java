package com.cenifex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDTO {
    private Long id;
    private String title;
    private String description;
    private String genre;
    private String language;
    private Integer durationInMinutes;
    private LocalDate releaseDate;
    private String posterUrl;
}
