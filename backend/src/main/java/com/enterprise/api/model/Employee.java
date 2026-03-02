package com.enterprise.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "employees")
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    private String id;
    
    @Column(name = "company_id")
    private String companyId;
    
    @Column(name = "full_name")
    private String fullName;
    
    private String email;
    
    private String phone;
    
    private String status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (id == null) {
            id = "emp_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
