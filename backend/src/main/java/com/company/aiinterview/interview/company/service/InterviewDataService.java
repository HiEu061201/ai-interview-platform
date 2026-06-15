package com.company.aiinterview.interview.company.service;

import com.company.aiinterview.interview.company.model.InterviewQuestion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InterviewDataService {

    @Value("${app.interview.data.path}")
    private String dataPath;

    public List<String> getAllCompanies() {
        File rootDir = new File(dataPath);
        if (!rootDir.exists() || !rootDir.isDirectory()) {
            log.warn("Interview data path does not exist or is not a directory: {}", dataPath);
            return new ArrayList<>();
        }

        File[] subdirs = rootDir.listFiles(File::isDirectory);
        if (subdirs == null)
            return new ArrayList<>();

        return Arrays.stream(subdirs)
                .map(File::getName)
                .sorted()
                .collect(Collectors.toList());
    }

    public List<InterviewQuestion> getQuestionsForCompany(String company) {
        List<InterviewQuestion> questions = new ArrayList<>();
        File companyCsv = new File(dataPath + File.separator + company + File.separator + "5. All.csv");

        if (!companyCsv.exists()) {
            log.warn("CSV file not found for company: {}", company);
            return questions;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(companyCsv))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }

                String[] columns = parseCsvLine(line);
                if (columns.length >= 6) {
                    questions.add(InterviewQuestion.builder()
                            .difficulty(columns[0].trim())
                            .title(columns[1].trim())
                            .frequency(columns[2].trim())
                            .acceptanceRate(columns[3].trim())
                            .link(columns[4].trim())
                            .topics(columns[5].trim())
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Error reading CSV for company {}: {}", company, e.getMessage());
        }

        return questions;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder currentToken = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(currentToken.toString());
                currentToken.setLength(0);
            } else {
                currentToken.append(c);
            }
        }
        result.add(currentToken.toString());

        return result.toArray(new String[0]);
    }
}
