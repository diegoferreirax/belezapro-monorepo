package com.belezapro.belezapro_api.features.expenses.repositories;

import com.belezapro.belezapro_api.features.expenses.models.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {

    List<Expense> findByAdminIdOrderByDateDesc(String adminId);

    List<Expense> findByAdminIdAndDateStartingWithOrderByDateDesc(String adminId, String datePrefix);
}
