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
@Document(collection = "schedule_overrides")
@CompoundIndex(name = "admin_date_unique", def = "{'adminId': 1, 'date': 1}", unique = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class ScheduleOverride extends Auditable {

    @Id
    private String id;

    private String adminId;
    private String date; // "YYYY-MM-DD"

    private String startTime;
    private String endTime;

    @Builder.Default
    private List<TimeRange> breaks = new ArrayList<>();

    @JsonProperty("isClosed")
    @Builder.Default
    private boolean isClosed = false;
}
