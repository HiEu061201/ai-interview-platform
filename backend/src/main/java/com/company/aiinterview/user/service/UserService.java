package com.company.aiinterview.user.service;

import com.company.aiinterview.user.dto.UserProfileDto;
import com.company.aiinterview.user.dto.UserAnalyticsDto;
import java.util.List;

public interface UserService {
    UserProfileDto getProfile();
    List<UserAnalyticsDto> getAnalytics();
}
