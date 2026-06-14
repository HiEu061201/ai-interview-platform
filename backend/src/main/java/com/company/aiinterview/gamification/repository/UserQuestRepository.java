package com.company.aiinterview.gamification.repository;

import com.company.aiinterview.gamification.entity.UserQuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserQuestRepository extends JpaRepository<UserQuest, Long> {
    List<UserQuest> findByUserIdAndAssignedDate(Long userId, LocalDate assignedDate);
    List<UserQuest> findByUserIdAndAssignedDateAndIsCompletedFalse(Long userId, LocalDate assignedDate);
}
