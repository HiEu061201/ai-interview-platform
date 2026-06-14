package com.company.aiinterview.interview.entity;

import com.company.aiinterview.common.entity.BaseEntity;
import com.company.aiinterview.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "position_role")
    private String positionRole;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "interview_type")
    private String interviewType;

    private String language;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)")
    private InterviewStatus status;

    @Column(name = "current_turn")
    private Integer currentTurn;

    @Column(name = "target_turns")
    private Integer targetTurns;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "overall_ai_summary", columnDefinition = "TEXT")
    private String overallAiSummary;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "tech_stack", length = 500)
    private String techStack;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "resume_text", columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(name = "is_hardcore", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isHardcore;
}
