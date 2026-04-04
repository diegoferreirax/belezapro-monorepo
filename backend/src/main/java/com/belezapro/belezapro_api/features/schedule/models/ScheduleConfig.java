package com.belezapro.belezapro_api.features.schedule.models;

import com.belezapro.belezapro_api.common.models.Auditable;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "schedule_configs")
@CompoundIndex(name = "admin_day_unique", def = "{'adminId': 1, 'dayOfWeek': 1}", unique = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class ScheduleConfig extends Auditable {

    @Id
    private String id;

    private String adminId;
    private Integer dayOfWeek; // 0 = Domingo ... 6 = Sábado

    private String startTime;  // "HH:mm"
    private String endTime;    // "HH:mm"

    @Builder.Default
    private List<TimeRange> breaks = new ArrayList<>();

    @JsonProperty("isClosed")
    @Builder.Default
    private boolean isClosed = false;
}
