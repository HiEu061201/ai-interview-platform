package com.company.aiinterview.chat.repository;

import com.company.aiinterview.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    @Query("SELECT c FROM ChatMessage c WHERE c.session.user.id = :userId AND c.sender = 'USER' AND c.suggestedAnswer IS NOT NULL AND c.suggestedAnswer != '' ORDER BY c.createdAt DESC")
    List<ChatMessage> findUserMistakes(@Param("userId") Long userId);

    List<ChatMessage> findTop20BySessionIdOrderByCreatedAtDesc(Long sessionId);

    long countBySessionId(Long sessionId);
}
