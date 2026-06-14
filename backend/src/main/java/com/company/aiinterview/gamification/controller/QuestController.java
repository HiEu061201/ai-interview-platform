package com.company.aiinterview.gamification.controller;

import com.company.aiinterview.gamification.dto.UserQuestDto;
import com.company.aiinterview.gamification.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping("/daily")
    public ResponseEntity<List<UserQuestDto>> getDailyQuests() {
        return ResponseEntity.ok(questService.getDailyQuests());
    }
}
