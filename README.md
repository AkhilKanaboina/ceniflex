# Cenifex - Online Movie Ticket Booking System

A full-stack web application for booking movie tickets across multiple theaters with integrated payment processing.

## 🎯 Overview

Cenifex is a Spring Boot-based movie booking platform that enables users to:
- Browse available movies
- Select showtimes across multiple theaters
- Pick seats interactively
- Process payments securely via Razorpay
- Manage booking history

## ✨ Key Features

- **Movie Discovery** - Browse and search movies with detailed information
- **Smart Showtime Search** - Filter showtimes by movie, date, and location (auto-grouped by theater)
- **Interactive Seat Selection** - Visual seat picker with dynamic pricing
- **Secure Payments** - Razorpay integration with signature verification
- **Two-Phase Booking** - Order creation followed by payment confirmation
- **User Management** - Registration, login, and booking history
- **Responsive UI** - Mobile-friendly frontend built with vanilla HTML/CSS/JavaScript

## 🛠 Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.5.11
- Spring Security (BCrypt password encoding)
- Spring Data JPA
- MySQL 8.0
- Razorpay SDK 1.4.6

**Frontend:**
- HTML5
- CSS3 (Responsive design)
- Vanilla JavaScript (ES6+)

**Database:**
- MySQL 8 with HikariCP connection pooling

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Razorpay account (for payment keys)

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cenifex
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
DB_URL=jdbc:mysql://localhost:3306/cenifex
DB_USERNAME=root
DB_PASSWORD=your_password
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret_key
PORT=8080
```

### 3. Database Setup
```sql
CREATE DATABASE cenifex;
USE cenifex;
```
Tables will be auto-created via Hibernate DDL on first run.

### 4. Build & Run
```bash
# Build with Maven
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

### Authentication
- **POST** `/auth/signup` - Register new user
- **POST** `/auth/login` - Authenticate user

### Movies
- **GET** `/api/movies` - List all movies
- **GET** `/api/movies/{id}` - Get movie details

### Showtimes
- **GET** `/api/showtimes/movie/{movieId}?date=YYYY-MM-DD` - Get showtimes (default: today)

### Booking & Seats
- **GET** `/api/booking/showtime/{showtimeId}/seats` - Get available seats
- **POST** `/api/booking/create` - Create booking order
- **POST** `/api/booking/verify-payment` - Verify payment & confirm booking
- **GET** `/api/booking/user/{username}` - Get user's booking history

**For detailed API documentation, see [PROJECT_REPORT.md](PROJECT_REPORT.md)**

## 🎬 User Flow

```
1. Login/Signup → 2. Browse Movies → 3. Select Showtime → 
4. Pick Seats → 5. Proceed to Payment → 6. Verify Payment → 
7. Booking Confirmed → 8. View Booking History
```

## 🔐 Security Features

- **Password Encryption** - BCrypt with strength 12
- **Payment Signature Verification** - HMAC-SHA256 validation for Razorpay
- **CSRF Protection** - Disabled for API (JWT recommended for production)
- **Session Management** - User session tracking
- **Input Validation** - Jakarta Bean Validation annotations

## 💾 Database Schema

**Core Entities:**
- `users` - User accounts
- `movies` - Movie catalog
- `theaters` - Theater locations
- `screens` - Theater screens
- `showtimes` - Movie showtimes
- `show_seats` - Individual seats with pricing
- `bookings` - Booking records
- `booking_seats` - Booked seats per booking

## 🎯 Payment Flow

### Order Creation
1. User selects seats and initiates booking
2. Backend creates Razorpay order
3. Returns order ID and key to frontend
4. Frontend opens Razorpay payment modal

### Payment Verification
1. User completes payment
2. Frontend sends payment details to backend
3. Backend verifies signature with Razorpay secret
4. On success: Mark booking CONFIRMED, lock seats
5. On failure: Mark booking FAILED, keep seats available

## 📁 Project Structure

```
cenifex/
├── src/main/java/com/cenifex/
│   ├── controller/          # REST API endpoints
│   ├── service/             # Business logic
│   ├── repository/          # Data access (Spring Data JPA)
│   ├── entity/              # JPA entities
│   ├── dto/                 # Data transfer objects
│   ├── config/              # Security configuration
│   └── CenifexApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── static/              # Frontend assets
│       ├── *.html           # Pages
│       ├── css/             # Stylesheets
│       └── js/              # Client-side logic
└── pom.xml
```

## 🔧 Configuration

**application.properties:**
```properties
spring.application.name=cenifex
server.port=8080
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
razorpay.key.id=${RAZORPAY_KEY}
razorpay.key.secret=${RAZORPAY_SECRET}
```

## 🧪 Testing

```bash
# Run tests
mvn test

# Build JAR
mvn clean package
```

## 📦 Deployment

### Docker (Optional)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/cenifex-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Environment for Production
- Set `spring.jpa.hibernate.ddl-auto=validate`
- Use strong database passwords
- Configure CORS for frontend domain only
- Implement JWT tokens for session management
- Enable HTTPS/SSL
- Use environment variables for all secrets

## 🐛 Common Issues

### Database Connection Error
- Verify MySQL is running
- Check DB credentials in environment variables
- Ensure database `cenifex` exists

### Razorpay Payment Fails
- Verify API keys are correct
- Check Razorpay account status
- Ensure test mode is enabled for development

### Seat Locking Issues
- Payment verification signature validation failed
- Check Razorpay secret key in backend config
- Verify payment response includes correct order ID

## 📝 Dependencies

- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- Spring Boot Starter Mail
- MySQL Connector
- Razorpay SDK
- Lombok

See `pom.xml` for complete dependency list.

## 🎓 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Razorpay Integration](https://razorpay.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc)

## 📄 Documentation

For comprehensive architecture, design decisions, and detailed implementation, refer to [PROJECT_REPORT.md](PROJECT_REPORT.md)

## 📞 Support

For issues or questions:
1. Check the [PROJECT_REPORT.md](PROJECT_REPORT.md) for detailed documentation
2. Review error logs in terminal output
3. Verify environment variables and database configuration

## 📄 License

This project is provided as-is for educational and commercial purposes.

---

**Version:** 0.0.1-SNAPSHOT  
**Status:** ✅ Production Ready  
**Last Updated:** April 2026
