package com.cenifex.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingResponseDTO {
    private Long bookingId;
    private String movieTitle;
    private String theaterName;
    private String screenName;
    private LocalDate showDate;
    private LocalTime startTime;
    private List<String> bookedSeats;
    private BigDecimal totalAmount;
    private String status;
}
