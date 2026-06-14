package com.company.aiinterview.study.repository;

import com.company.aiinterview.study.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    Optional<StudyMaterial> findBySlug(String slug);
    List<StudyMaterial> findByCategoryIdOrderByDisplayOrderAsc(Long categoryId);
}
