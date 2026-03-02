package com.enterprise.repository;

import com.enterprise.entity.RoleDataScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleDataScopeRepository extends JpaRepository<RoleDataScope, RoleDataScope.RoleDataScopeId> {
}
