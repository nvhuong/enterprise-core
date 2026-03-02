package com.enterprise.controller;

import com.enterprise.dto.DashboardChartDto;
import com.enterprise.dto.DashboardStatsDto;
import com.enterprise.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Allow frontend to access
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<List<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/chart")
    public ResponseEntity<List<DashboardChartDto>> getChartData() {
        return ResponseEntity.ok(dashboardService.getChartData());
    }
}
