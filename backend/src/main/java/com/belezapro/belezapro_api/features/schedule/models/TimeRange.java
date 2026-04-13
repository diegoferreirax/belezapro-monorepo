package com.belezapro.belezapro_api.features.schedule.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeRange {
    private String start; // "HH:mm"
    private String end;   // "HH:mm"
}
