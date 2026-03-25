package com.cenifex.service;

import com.cenifex.dto.BookingRequest;
import com.cenifex.entity.Booking;
import com.cenifex.entity.BookingSeat;
import com.cenifex.entity.ShowSeat;
import com.cenifex.entity.Showtime;
import com.cenifex.entity.User;
import com.cenifex.repository.BookingRepository;
import com.cenifex.repository.BookingSeatRepository;
import com.cenifex.repository.ShowSeatRepository;
import com.cenifex.repository.ShowtimeRepository;
import com.cenifex.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import com.cenifex.dto.PaymentVerificationRequest;

@Service
public class BookingService {

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Transactional
    public Booking createBooking(BookingRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        List<ShowSeat> selectedSeats = showSeatRepository.findAllById(request.getSeatIds());
        
        if (selectedSeats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("One or more selected seats do not exist");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ShowSeat seat : selectedSeats) {
            if (seat.isBooked() || !seat.getShowtime().getId().equals(showtime.getId())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked or invalid.");
            }
            // DO NOT lock the seat here. Wait until payment is successful!
            totalAmount = totalAmount.add(seat.getPrice());
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("PENDING");

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            // amount in paise
            orderRequest.put("amount", totalAmount.multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            booking.setRazorpayOrderId(order.get("id"));
        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order", e);
        }

        Booking savedBooking = bookingRepository.save(booking);

        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (ShowSeat seat : selectedSeats) {
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setShowSeat(seat);
            bookingSeats.add(bookingSeat);
        }
        
        bookingSeatRepository.saveAll(bookingSeats);

        return savedBooking;
    }

    @Transactional
    public Booking verifyPayment(PaymentVerificationRequest request) {
        Booking booking = bookingRepository.findByRazorpayOrderId(request.getRazorpayOrderId());
        if (booking == null) {
            throw new RuntimeException("Booking not found for order id: " + request.getRazorpayOrderId());
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean status = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            
            if (status) {
                booking.setStatus("CONFIRMED");
                booking.setRazorpayPaymentId(request.getRazorpayPaymentId());
                
                // Fetch the seats associated with this booking and mark them as booked!
                List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
                for (BookingSeat bs : bookingSeats) {
                    ShowSeat seat = bs.getShowSeat();
                    seat.setBooked(true);
                    showSeatRepository.save(seat);
                }
                
                return bookingRepository.save(booking);
            } else {
                booking.setStatus("FAILED");
                bookingRepository.save(booking);
                throw new RuntimeException("Payment Signature Verification Failed");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying payment signature", e);
        }
    }

    @Transactional(readOnly = true)
    public List<com.cenifex.dto.BookingResponseDTO> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        
        List<com.cenifex.dto.BookingResponseDTO> responseList = new ArrayList<>();
        for (Booking booking : bookings) {
            com.cenifex.dto.BookingResponseDTO dto = new com.cenifex.dto.BookingResponseDTO();
            dto.setBookingId(booking.getId());
            dto.setMovieTitle(booking.getShowtime().getMovie().getTitle());
            dto.setTheaterName(booking.getShowtime().getScreen().getTheater().getName());
            dto.setScreenName(booking.getShowtime().getScreen().getName());
            dto.setShowDate(booking.getShowtime().getShowDate());
            dto.setStartTime(booking.getShowtime().getStartTime());
            dto.setTotalAmount(booking.getTotalAmount());
            dto.setStatus(booking.getStatus());

            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
            List<String> seatNumbers = new ArrayList<>();
            for (BookingSeat bs : bookingSeats) {
                seatNumbers.add(bs.getShowSeat().getSeatNumber());
            }
            dto.setBookedSeats(seatNumbers);
            
            responseList.add(dto);
        }
        
        return responseList;
    }
}
