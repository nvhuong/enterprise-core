package com.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardChartDto {
    private String name;
    private Integer uv;
    private Integer pv;
    private Integer amt;
}
