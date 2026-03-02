package com.enterprise.api.controller;

import com.enterprise.api.model.Company;
import com.enterprise.api.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Company> getAll() {
        return companyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable String id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company create(@RequestBody Company company) {
        return companyRepository.save(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(@PathVariable String id, @RequestBody Company companyDetails) {
        return companyRepository.findById(id)
                .map(company -> {
                    if (companyDetails.getName() != null) company.setName(companyDetails.getName());
                    if (companyDetails.getCompanyType() != null) company.setCompanyType(companyDetails.getCompanyType());
                    if (companyDetails.getTaxCode() != null) company.setTaxCode(companyDetails.getTaxCode());
                    if (companyDetails.getStatus() != null) company.setStatus(companyDetails.getStatus());
                    return ResponseEntity.ok(companyRepository.save(company));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
