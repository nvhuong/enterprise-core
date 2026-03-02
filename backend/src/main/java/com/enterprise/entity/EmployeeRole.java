package com.enterprise.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "employee_role")
public class EmployeeRole {

    @EmbeddedId
    private EmployeeRoleId id;

    @ManyToOne
    @MapsId("employeeId")
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne
    @MapsId("organizationUnitId")
    @JoinColumn(name = "organization_unit_id")
    private OrganizationUnit organizationUnit;

    private String title;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @Data
    @Embeddable
    @EqualsAndHashCode
    public static class EmployeeRoleId implements Serializable {
        private UUID employeeId;
        private UUID roleId;
        private UUID organizationUnitId;
    }
}
