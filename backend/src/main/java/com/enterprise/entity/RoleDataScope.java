package com.enterprise.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.UUID;

@Data
@Entity
@Table(name = "role_data_scope")
public class RoleDataScope {

    @EmbeddedId
    private RoleDataScopeId id;

    @ManyToOne
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne
    @MapsId("organizationUnitId")
    @JoinColumn(name = "organization_unit_id")
    private OrganizationUnit organizationUnit;

    @Column(name = "include_child")
    private Boolean includeChild = false;

    @Data
    @Embeddable
    @EqualsAndHashCode
    public static class RoleDataScopeId implements Serializable {
        private UUID roleId;
        private UUID organizationUnitId;
    }
}
