package com.cenifex.controller;

import com.cenifex.dto.BookingRequest;
import com.cenifex.dto.PaymentVerificationRequest;
import com.cenifex.dto.ShowSeatDTO;
import com.cenifex.entity.Booking;
import com.cenifex.repository.ShowSeatRepository;
import com.cenifex.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingService bookingService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @GetMapping("/showtime/{showtimeId}/seats")
    public ResponseEntity<List<ShowSeatDTO>> getSeatsForShowtime(@PathVariable Long showtimeId) {
        List<ShowSeatDTO> seats = showSeatRepository.findByShowtimeId(showtimeId).stream()
                .map(seat -> new ShowSeatDTO(seat.getId(), seat.getSeatNumber(), seat.getPrice(), seat.isBooked()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(request);
        return ResponseEntity.ok(Map.of(
                "message", "Order created. Pending payment.",
                "bookingId", booking.getId(),
                "razorpayOrderId", booking.getRazorpayOrderId(),
                "razorpayKeyId", razorpayKeyId,
                "totalAmount", booking.getTotalAmount()
        ));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        try {
            Booking booking = bookingService.verifyPayment(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Payment Successful!",
                    "bookingId", booking.getId(),
                    "status", booking.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserBookings(@PathVariable String username) {
        try {
            List<com.cenifex.dto.BookingResponseDTO> bookings = bookingService.getUserBookings(username);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
