package com.cenifex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowSeatDTO {
    private Long id;
    private String seatNumber;
    private BigDecimal price;
    private boolean isBooked;
}
