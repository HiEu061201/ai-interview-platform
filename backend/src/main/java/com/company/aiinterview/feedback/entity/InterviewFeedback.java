package com.company.aiinterview.feedback.entity;

import com.company.aiinterview.common.entity.BaseEntity;
import com.company.aiinterview.interview.entity.InterviewSession;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", unique = true, nullable = false)
    private InterviewSession session;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "clarity_score")
    private Integer clarityScore;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "detailed_review", columnDefinition = "TEXT")
    private String detailedReview;

    @Column(name = "improvement_plan", columnDefinition = "TEXT")
    private String improvementPlan;

    @Column(name = "recommendation_level")
    private String recommendationLevel;
}
