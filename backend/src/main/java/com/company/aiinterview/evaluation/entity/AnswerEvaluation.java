package com.company.aiinterview.evaluation.entity;

import com.company.aiinterview.chat.entity.ChatMessage;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "answer_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AnswerEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", unique = true, nullable = false)
    private ChatMessage message;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "clarity_score")
    private Integer clarityScore;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "relevance_score")
    private Integer relevanceScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "suggested_improvement", columnDefinition = "TEXT")
    private String suggestedImprovement;

    @Column(name = "detailed_review", columnDefinition = "TEXT")
    private String detailedReview;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
