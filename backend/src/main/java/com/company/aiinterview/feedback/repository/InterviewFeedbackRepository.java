package com.company.aiinterview.feedback.repository;

import com.company.aiinterview.feedback.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    Optional<InterviewFeedback> findBySessionId(Long sessionId);

    boolean existsBySessionId(Long sessionId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM InterviewFeedback f JOIN FETCH f.session WHERE f.session.user.id = :userId ORDER BY f.session.createdAt ASC")
    java.util.List<InterviewFeedback> findBySessionUserIdOrderBySessionCreatedAtAsc(@org.springframework.data.repository.query.Param("userId") Long userId);
}
