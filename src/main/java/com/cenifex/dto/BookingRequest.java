package com.cenifex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {
    @NotNull(message = "Showtime ID cannot be null")
    private Long showtimeId;

    @NotEmpty(message = "You must select at least one seat")
    private List<Long> seatIds;

    @NotBlank(message = "Username is required to map the booking")
    private String username;
}
