package com.company.aiinterview.study;

import com.company.aiinterview.study.entity.StudyCategory;
import com.company.aiinterview.study.entity.StudyMaterial;
import com.company.aiinterview.study.repository.StudyCategoryRepository;
import com.company.aiinterview.study.repository.StudyMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudyDataSeeder implements CommandLineRunner {

    private final StudyCategoryRepository categoryRepository;
    private final StudyMaterialRepository materialRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            log.info("Seeding Study Categories and Materials...");

            // 1. Backend Category
            StudyCategory backend = categoryRepository.save(StudyCategory.builder()
                    .name("Backend")
                    .slug("backend")
                    .description("Kiến trúc, RESTful, GraphQL, Caching, v.v.")
                    .displayOrder(1)
                    .build());

            materialRepository.save(StudyMaterial.builder()
                    .category(backend)
                    .title("RESTful API là gì?")
                    .slug("restful-api-la-gi")
                    .content("## RESTful API là gì?\nREST (Representational State Transfer) là một kiểu kiến trúc phần mềm...")
                    .displayOrder(1)
                    .build());
            
            materialRepository.save(StudyMaterial.builder()
                    .category(backend)
                    .title("Phân biệt Caching và Message Queue")
                    .slug("phan-biet-caching-va-message-queue")
                    .content("## Caching\nCaching giúp giảm tải cho database bằng cách lưu dữ liệu thường xuyên truy cập vào RAM...\n\n## Message Queue\nGiúp xử lý bất đồng bộ...")
                    .displayOrder(2)
                    .build());

            // 2. Database Category
            StudyCategory database = categoryRepository.save(StudyCategory.builder()
                    .name("Database")
                    .slug("database")
                    .description("SQL vs NoSQL, Indexing, ACID, Sharding.")
                    .displayOrder(2)
                    .build());

            materialRepository.save(StudyMaterial.builder()
                    .category(database)
                    .title("Tính chất ACID trong Database")
                    .slug("tinh-chat-acid-trong-database")
                    .content("## ACID là gì?\nACID bao gồm 4 thuộc tính: Atomicity, Consistency, Isolation, Durability...")
                    .displayOrder(1)
                    .build());

            // 3. System Design
            StudyCategory system = categoryRepository.save(StudyCategory.builder()
                    .name("System Design")
                    .slug("system-design")
                    .description("Các khái niệm cốt lõi, Load Balancing, Microservices.")
                    .displayOrder(3)
                    .build());

            materialRepository.save(StudyMaterial.builder()
                    .category(system)
                    .title("Load Balancing cơ bản")
                    .slug("load-balancing-co-ban")
                    .content("## Load Balancing\nLà quá trình phân phối traffic mạng tới nhiều server khác nhau để đảm bảo không server nào bị quá tải...")
                    .displayOrder(1)
                    .build());

            // 4. DevOps & Cloud
            StudyCategory devops = categoryRepository.save(StudyCategory.builder()
                    .name("DevOps & Cloud")
                    .slug("devops-cloud")
                    .description("CI/CD, Docker, Kubernetes, AWS/GCP cơ bản.")
                    .displayOrder(4)
                    .build());

            materialRepository.save(StudyMaterial.builder()
                    .category(devops)
                    .title("Docker là gì và tại sao nên dùng?")
                    .slug("docker-la-gi-va-tai-sao-nen-dung")
                    .content("## Docker\nDocker là một nền tảng open-source giúp đóng gói ứng dụng thành các container độc lập...")
                    .displayOrder(1)
                    .build());

            log.info("Study Data Seeding completed.");
        }
    }
}
