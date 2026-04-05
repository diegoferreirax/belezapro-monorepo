package com.belezapro.belezapro_api.features.appointments.services;

import com.belezapro.belezapro_api.features.appointments.models.Appointment;
import com.belezapro.belezapro_api.features.appointments.models.AppointmentStatus;
import com.belezapro.belezapro_api.features.appointments.repositories.AppointmentRepository;
import com.belezapro.belezapro_api.features.services.models.ServiceItem;
import com.belezapro.belezapro_api.features.services.repositories.ServiceItemRepository;
import com.belezapro.belezapro_api.features.users.models.User;
import com.belezapro.belezapro_api.features.users.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceItemRepository serviceItemRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              ServiceItemRepository serviceItemRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceItemRepository = serviceItemRepository;
    }

    public Page<Appointment> getPaginatedList(String adminId, String clientId, String term, String startDate, String endDate, AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findAppointmentsDynamic(adminId, clientId, term, startDate, endDate, status, pageable);
    }

    public Page<Appointment> getPaginatedClientList(String clientId, String companyId, String term, String startDate, String endDate, AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findClientAppointmentsDynamic(clientId, companyId, term, startDate, endDate, status, pageable);
    }

    public List<String> getClientCompanyIds(String clientId) {
        return appointmentRepository.findDistinctCompanyIdsByClientId(clientId);
    }

    public List<Appointment> getRangeForCalendar(String adminId, String startDate, String endDate) {
        return appointmentRepository.findAllByAdminIdAndDateBetween(adminId, startDate, endDate);
    }

    public List<Appointment> getActiveByDate(String adminId, String date) {
        return appointmentRepository.findActiveByAdminIdAndDate(adminId, date);
    }

    public Appointment create(String adminId, Appointment data) {
        data.setAdminId(adminId);
        if (data.getStatus() == null) {
            data.setStatus(AppointmentStatus.PENDING);
        }
        
        enrichAppointmentData(adminId, data);
        
        return appointmentRepository.save(data);
    }

    public Appointment update(String adminId, String id, Appointment incoming) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (!existing.getAdminId().equals(adminId)) {
            throw new RuntimeException("Acesso negado." );
        }

        existing.setClientId(incoming.getClientId());
        existing.setServiceIds(incoming.getServiceIds());
        existing.setDate(incoming.getDate());
        existing.setStartTime(incoming.getStartTime());
        existing.setStatus(incoming.getStatus());

        enrichAppointmentData(adminId, existing);

        return appointmentRepository.save(existing);
    }

    public void delete(String adminId, String id) {
        Appointment existing = appointmentRepository.findById(id).orElse(null);
        if (existing != null && existing.getAdminId().equals(adminId)) {
            appointmentRepository.deleteById(id);
        }
    }

    public void cancelActiveAppointmentsByDate(String adminId, String date) {
        List<Appointment> actives = appointmentRepository.findActiveByAdminIdAndDate(adminId, date);
        for (Appointment app : actives) {
            app.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(app); // No update batch for noSql in Spring Data natively without bulkOps. we will simple loop iterate.
        }
    }

    /**
     * Aplica a Desnormalizacao dos Dados
     */
    private void enrichAppointmentData(String adminId, Appointment appointment) {
        // Encontra o ClientName
        User client = userRepository.findById(appointment.getClientId()).orElse(null);
        if (client != null) {
            appointment.setClientName(client.getName());
        }

        // Popula as listas de nomes os servicos e re-calcula as financas.
        List<String> serviceNames = new ArrayList<>();
        BigDecimal totalPricing = BigDecimal.ZERO;
        int totalMinutes = 0;

        if (appointment.getServiceIds() != null && !appointment.getServiceIds().isEmpty()) {
            Iterable<ServiceItem> services = serviceItemRepository.findAllById(appointment.getServiceIds());
            for (ServiceItem s : services) {
                // Valida tenant
                if(s.getAdminId().equals(adminId)) {
                    serviceNames.add(s.getName());
                    totalPricing = totalPricing.add(s.getPrice());
                    totalMinutes += s.getDurationMinutes();
                }
            }
        }

        appointment.setParsedServiceNames(serviceNames);
        appointment.setTotalPrice(totalPricing);
        appointment.setTotalDurationMinutes(totalMinutes);
    }
}
