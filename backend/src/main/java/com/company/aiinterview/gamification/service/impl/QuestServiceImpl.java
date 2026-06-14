package com.company.aiinterview.gamification.service.impl;

import com.company.aiinterview.common.security.SecurityUtils;
import com.company.aiinterview.gamification.dto.UserQuestDto;
import com.company.aiinterview.gamification.entity.QuestType;
import com.company.aiinterview.gamification.entity.UserQuest;
import com.company.aiinterview.gamification.repository.UserQuestRepository;
import com.company.aiinterview.gamification.service.QuestService;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.user.entity.User;
import com.company.aiinterview.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestServiceImpl implements QuestService {

    private final UserQuestRepository userQuestRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final Random random = new Random();

    @Override
    @Transactional
    public List<UserQuestDto> getDailyQuests() {
        User user = securityUtils.getCurrentUser();
        LocalDate today = LocalDate.now();

        List<UserQuest> quests = userQuestRepository.findByUserIdAndAssignedDate(user.getId(), today);

        if (quests.isEmpty()) {
            quests = generateDailyQuests(user, today);
            userQuestRepository.saveAll(quests);
        }

        return quests.stream().map(this::mapToDto).toList();
    }

    private List<UserQuest> generateDailyQuests(User user, LocalDate today) {
        List<UserQuest> quests = new ArrayList<>();

        // Quest 1: Always complete 1 interview
        quests.add(UserQuest.builder()
                .user(user)
                .questType(QuestType.COMPLETE_ANY)
                .title("Chăm chỉ")
                .description("Hoàn thành 1 bài phỏng vấn bất kỳ")
                .targetValue(1)
                .rewardExp(50)
                .assignedDate(today)
                .build());

        // Quest 2: Random between Hardcore or High Score
        if (random.nextBoolean()) {
            quests.add(UserQuest.builder()
                    .user(user)
                    .questType(QuestType.COMPLETE_HARDCORE)
                    .title("Kẻ thách thức")
                    .description("Hoàn thành 1 bài phỏng vấn ở chế độ Hardcore")
                    .targetValue(1)
                    .rewardExp(100)
                    .assignedDate(today)
                    .build());
        } else {
            quests.add(UserQuest.builder()
                    .user(user)
                    .questType(QuestType.ACHIEVE_HIGH_SCORE)
                    .title("Thành tích xuất sắc")
                    .description("Đạt điểm tổng quát >= 80 trong một bài phỏng vấn")
                    .targetValue(1)
                    .rewardExp(150)
                    .assignedDate(today)
                    .build());
        }

        return quests;
    }

    @Override
    @Transactional
    public void processInterviewCompletion(InterviewSession session) {
        if (session.getUser() == null) return;
        
        LocalDate today = LocalDate.now();
        List<UserQuest> activeQuests = userQuestRepository.findByUserIdAndAssignedDateAndIsCompletedFalse(session.getUser().getId(), today);
        
        if (activeQuests.isEmpty()) return;

        User user = session.getUser();
        int bonusExp = 0;

        for (UserQuest quest : activeQuests) {
            boolean isMatched = false;

            switch (quest.getQuestType()) {
                case COMPLETE_ANY:
                    isMatched = true;
                    break;
                case COMPLETE_HARDCORE:
                    if (Boolean.TRUE.equals(session.getIsHardcore())) {
                        isMatched = true;
                    }
                    break;
                case ACHIEVE_HIGH_SCORE:
                    if (session.getOverallScore() != null && session.getOverallScore() >= 80) {
                        isMatched = true;
                    }
                    break;
            }

            if (isMatched) {
                quest.setCurrentValue(quest.getCurrentValue() + 1);
                if (quest.getCurrentValue() >= quest.getTargetValue()) {
                    quest.setIsCompleted(true);
                    bonusExp += quest.getRewardExp();
                }
            }
        }

        if (bonusExp > 0) {
            int currentExp = user.getExp() != null ? user.getExp() : 0;
            int currentLevel = user.getLevel() != null ? user.getLevel() : 1;
            
            currentExp += bonusExp;
            while (currentExp >= currentLevel * 100) {
                currentExp -= currentLevel * 100;
                currentLevel++;
            }
            
            user.setExp(currentExp);
            user.setLevel(currentLevel);
            userRepository.save(user);
        }

        userQuestRepository.saveAll(activeQuests);
    }

    private UserQuestDto mapToDto(UserQuest quest) {
        return UserQuestDto.builder()
                .id(quest.getId())
                .questType(quest.getQuestType().name())
                .title(quest.getTitle())
                .description(quest.getDescription())
                .targetValue(quest.getTargetValue())
                .currentValue(quest.getCurrentValue())
                .rewardExp(quest.getRewardExp())
                .isCompleted(quest.getIsCompleted())
                .assignedDate(quest.getAssignedDate())
                .build();
    }
}
