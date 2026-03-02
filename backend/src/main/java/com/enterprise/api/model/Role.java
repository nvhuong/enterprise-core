package com.enterprise.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    private String id;
    
    @Column(name = "company_id")
    private String companyId;
    
    private String name;
    
    private String description;
    
    @Column(name = "is_default")
    private Integer isDefault;
    
    private String status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (id == null) {
            id = "role_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (status == null) {
            status = "ACTIVE";
        }
        if (isDefault == null) {
            isDefault = 0;
        }
    }
}
