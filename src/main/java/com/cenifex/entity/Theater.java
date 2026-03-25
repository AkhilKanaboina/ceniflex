package com.cenifex.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "theater")
@Data
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    private String address;
}
