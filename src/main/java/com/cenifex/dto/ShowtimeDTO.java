package com.cenifex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeDTO {
    private Long id;
    private LocalTime startTime;
    private String screenName;
}
