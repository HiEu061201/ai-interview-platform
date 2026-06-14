package com.company.aiinterview.gamification.service;

import com.company.aiinterview.gamification.dto.UserQuestDto;
import com.company.aiinterview.interview.entity.InterviewSession;

import java.util.List;

public interface QuestService {
    List<UserQuestDto> getDailyQuests();
    void processInterviewCompletion(InterviewSession session);
}
