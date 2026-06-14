package com.company.aiinterview.evaluation.repository;

import com.company.aiinterview.evaluation.entity.AnswerEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerEvaluationRepository extends JpaRepository<AnswerEvaluation, Long> {

    Optional<AnswerEvaluation> findByMessageId(Long messageId);

    List<AnswerEvaluation> findByMessageSessionId(Long sessionId);

    @Query("""
    SELECT AVG(e.technicalScore)
    FROM AnswerEvaluation e
    WHERE e.message.session.id = :sessionId
    """)
    BigDecimal calculateTechnicalAverage(@Param("sessionId") Long sessionId);
}
