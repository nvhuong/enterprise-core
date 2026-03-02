package com.enterprise.api.controller;

import com.enterprise.api.model.Role;
import com.enterprise.api.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public List<Role> getAll(@RequestParam String companyId) {
        return roleRepository.findByCompanyId(companyId);
    }

    @PostMapping
    public Role create(@RequestParam String companyId, @RequestBody Role role) {
        role.setCompanyId(companyId);
        return roleRepository.save(role);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> update(@PathVariable String id, @RequestBody Role roleDetails) {
        return roleRepository.findById(id)
                .map(role -> {
                    if (roleDetails.getName() != null) role.setName(roleDetails.getName());
                    if (roleDetails.getDescription() != null) role.setDescription(roleDetails.getDescription());
                    if (roleDetails.getStatus() != null) role.setStatus(roleDetails.getStatus());
                    return ResponseEntity.ok(roleRepository.save(role));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
