package com.company.aiinterview.job.service.impl;

import com.company.aiinterview.job.dto.JobRecommendationDto;
import com.company.aiinterview.job.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    @Override
    public List<JobRecommendationDto> getRecommendations(String keyword) {
        try {
            String actualKeyword = keyword == null || keyword.isBlank() ? "Java" : keyword;
            
            String formattedKeyword = actualKeyword.toLowerCase().replace(" ", "-");
            String url = "https://careerviet.vn/viec-lam/" + formattedKeyword + "-k-vi.html";

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();

            Elements jobItems = doc.select(".job-item");
            List<JobRecommendationDto> recommendations = new ArrayList<>();

            for (Element item : jobItems) {
                if (recommendations.size() >= 5) break;

                Element titleEl = item.selectFirst(".title .job_link");
                Element companyEl = item.selectFirst(".company-name");
                Element salaryEl = item.selectFirst(".salary p");
                Element locationEl = item.selectFirst(".location");
                Element timeEl = item.selectFirst(".time");

                if (titleEl != null && companyEl != null) {
                    String title = titleEl.text();
                    String link = titleEl.attr("href");
                    if (link.startsWith("/")) {
                        link = "https://careerviet.vn" + link;
                    }
                    String company = companyEl.text();
                    String salary = salaryEl != null ? salaryEl.text().replace("Lương: ", "").trim() : "Thỏa thuận";
                    
                    String location = locationEl != null ? locationEl.text() : "";
                    String time = timeEl != null ? timeEl.text() : "";
                    String requirements = location + (location.isEmpty() || time.isEmpty() ? "" : " | ") + time;

                    recommendations.add(JobRecommendationDto.builder()
                            .title(title)
                            .company(company)
                            .salary(salary)
                            .requirements(requirements.isEmpty() ? "Chi tiết xem tại link" : requirements)
                            .link(link)
                            .build());
                }
            }
            
            if (recommendations.isEmpty()) {
                throw new RuntimeException("No jobs found, using fallback");
            }

            return recommendations;
        } catch (Exception e) {
            log.error("Failed to parse job recommendations.", e);
            // Fallback mock data
            List<JobRecommendationDto> fallback = new ArrayList<>();
            fallback.add(JobRecommendationDto.builder()
                .title("Java Backend Developer")
                .company("Tech Corp")
                .salary("Up to 2000$")
                .requirements("Java 11+, Spring Boot, Microservices")
                .link("https://careerviet.vn")
                .build());
            return fallback;
        }
    }
}
