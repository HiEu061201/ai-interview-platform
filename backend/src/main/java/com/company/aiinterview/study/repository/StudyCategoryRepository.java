package com.company.aiinterview.study.repository;

import com.company.aiinterview.study.entity.StudyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudyCategoryRepository extends JpaRepository<StudyCategory, Long> {
    Optional<StudyCategory> findBySlug(String slug);
    List<StudyCategory> findAllByOrderByDisplayOrderAsc();
}
