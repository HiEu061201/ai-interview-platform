package com.company.aiinterview.interview.repository;

import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.interview.entity.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserId(Long userId);

    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<InterviewSession> findByUserId(Long userId, Pageable pageable);

    List<InterviewSession> findByStatus(InterviewStatus status);

    @Query("""
    SELECT s
    FROM InterviewSession s
    WHERE s.user.id = :userId
    AND s.status = :status
    ORDER BY s.createdAt DESC
    """)
    List<InterviewSession> findUserSessions(
            @Param("userId") Long userId,
            @Param("status") InterviewStatus status);
}
