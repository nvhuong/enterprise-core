package com.enterprise.api.repository;

import com.enterprise.api.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    List<Role> findByCompanyId(String companyId);
}
