package com.cenifex.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "screen")
@Data
public class Screen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;
}
