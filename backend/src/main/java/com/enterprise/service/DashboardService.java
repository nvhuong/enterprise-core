package com.enterprise.service;

import com.enterprise.dto.DashboardChartDto;
import com.enterprise.dto.DashboardStatsDto;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DashboardService {

    public List<DashboardStatsDto> getStats() {
        // Mock data matching frontend
        return Arrays.asList(
                new DashboardStatsDto("Total Revenue", "$45,231.89", "+20.1%", "up"),
                new DashboardStatsDto("Active Users", "+2350", "+180.1%", "up"),
                new DashboardStatsDto("Sales", "+12,234", "+19%", "up"),
                new DashboardStatsDto("Active Now", "+573", "+201", "up")
        );
    }

    public List<DashboardChartDto> getChartData() {
        // Mock data matching frontend
        return Arrays.asList(
                new DashboardChartDto("Jan", 4000, 2400, 2400),
                new DashboardChartDto("Feb", 3000, 1398, 2210),
                new DashboardChartDto("Mar", 2000, 9800, 2290),
                new DashboardChartDto("Apr", 2780, 3908, 2000),
                new DashboardChartDto("May", 1890, 4800, 2181),
                new DashboardChartDto("Jun", 2390, 3800, 2500),
                new DashboardChartDto("Jul", 3490, 4300, 2100)
        );
    }
}
