CREATE DATABASE  IF NOT EXISTS `jobs_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `jobs_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: jobs_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applicants`
--

DROP TABLE IF EXISTS `applicants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applicants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `profession_id` int DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `about` text,
  `expected_salary` int DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `profession_id` (`profession_id`),
  CONSTRAINT `applicants_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applicants_ibfk_2` FOREIGN KEY (`profession_id`) REFERENCES `professions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applicants`
--

LOCK TABLES `applicants` WRITE;
/*!40000 ALTER TABLE `applicants` DISABLE KEYS */;
INSERT INTO `applicants` VALUES (1,1,1,'1995-05-15','Москва','Опытный Python разработчик, специализируюсь на веб-приложениях',150000,5,'МГУ, Прикладная математика',1,'2026-03-11 20:09:48'),(2,2,3,'1998-08-22','Санкт-Петербург','Frontend разработчик, React, Vue.js',120000,3,'ИТМО, Программная инженерия',1,'2026-03-11 20:09:48'),(3,3,10,'1993-03-10','Москва','Data Scientist, машинное обучение и анализ данных',200000,6,'МФТИ, Прикладная математика и физика',1,'2026-03-11 20:09:48'),(4,4,13,'1996-11-30','Казань','UI/UX дизайнер, создаю удобные интерфейсы',90000,4,'КФУ, Дизайн',1,'2026-03-11 20:09:48'),(5,5,6,'1994-07-18','Новосибирск','Fullstack разработчик, Python + JavaScript',160000,5,'НГУ, Информатика',1,'2026-03-11 20:09:48'),(6,6,16,'1997-09-25','Екатеринбург','HR менеджер, подбор IT специалистов',80000,3,'УрФУ, Управление персоналом',1,'2026-03-11 20:09:48'),(7,7,7,'1992-12-05','Москва','DevOps инженер, CI/CD, Kubernetes',220000,7,'Бауманка, Информатика',1,'2026-03-11 20:09:48'),(8,8,9,'1995-04-14','Нижний Новгород','Аналитик данных, SQL, Python',110000,4,'ННГУ, Экономика',1,'2026-03-11 20:09:48'),(9,9,17,'1996-06-20','Самара','Тестировщик, автоматизация тестирования',85000,3,'СамГУ, Информатика',1,'2026-03-11 20:09:48'),(10,10,11,'1991-01-08','Москва','Project Manager, управляю IT проектами',180000,8,'ВШЭ, Менеджмент',1,'2026-03-11 20:09:48');
/*!40000 ALTER TABLE `applicants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `city` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,11,'Яндекс','Крупнейшая IT компания России, поисковая система и интернет-сервисы','Москва','/logos/yandex.png','2026-03-11 20:09:48'),(2,12,'Mail.ru Group','Технологическая компания, владелец крупнейших интернет-проектов','Москва','/logos/mailru.png','2026-03-11 20:09:48'),(3,13,'Сбер','Крупнейший банк России, развивает IT направления','Москва','/logos/sber.png','2026-03-11 20:09:48'),(4,14,'Ozon','Крупнейший онлайн-ритейлер, маркетплейс','Москва','/logos/ozon.png','2026-03-11 20:09:48'),(5,15,'Wildberries','Крупнейший маркетплейс России','Москва','/logos/wb.png','2026-03-11 20:09:48'),(6,16,'Avito','Платформа объявлений №1 в России','Москва','/logos/avito.png','2026-03-11 20:09:48'),(7,17,'VK','Социальная сеть ВКонтакте и экосистема сервисов','Санкт-Петербург','/logos/vk.png','2026-03-11 20:09:48'),(8,18,'Тинькофф','Финансовая онлайн-экосистема','Москва','/logos/tinkoff.png','2026-03-11 20:09:48'),(9,19,'2ГИС','Картографическая компания, разработчик приложений','Новосибирск','/logos/2gis.png','2026-03-11 20:09:48'),(10,20,'Лаборатория Касперского','Разработчик антивирусного ПО','Москва','/logos/kaspersky.png','2026-03-11 20:09:48');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professions`
--

DROP TABLE IF EXISTS `professions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professions`
--

LOCK TABLES `professions` WRITE;
/*!40000 ALTER TABLE `professions` DISABLE KEYS */;
INSERT INTO `professions` VALUES (1,'Python разработчик','2026-03-11 20:09:48'),(2,'Java разработчик','2026-03-11 20:09:48'),(3,'JavaScript разработчик','2026-03-11 20:09:48'),(4,'Frontend разработчик','2026-03-11 20:09:48'),(5,'Backend разработчик','2026-03-11 20:09:48'),(6,'Fullstack разработчик','2026-03-11 20:09:48'),(7,'DevOps инженер','2026-03-11 20:09:48'),(8,'Системный администратор','2026-03-11 20:09:48'),(9,'Аналитик данных','2026-03-11 20:09:48'),(10,'Data Scientist','2026-03-11 20:09:48'),(11,'Project Manager','2026-03-11 20:09:48'),(12,'Product Manager','2026-03-11 20:09:48'),(13,'UI/UX дизайнер','2026-03-11 20:09:48'),(14,'Графический дизайнер','2026-03-11 20:09:48'),(15,'Менеджер по продажам','2026-03-11 20:09:48'),(16,'HR менеджер','2026-03-11 20:09:48'),(17,'Тестировщик','2026-03-11 20:09:48'),(18,'Android разработчик','2026-03-11 20:09:48'),(19,'iOS разработчик','2026-03-11 20:09:48'),(20,'SEO специалист','2026-03-11 20:09:48');
/*!40000 ALTER TABLE `professions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_responses`
--

DROP TABLE IF EXISTS `resume_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resume_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `message` text,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_resume_company` (`resume_id`,`company_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `resume_responses_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resume_responses_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resume_responses_chk_1` CHECK ((`status` in (_utf8mb3'pending',_utf8mb3'viewed',_utf8mb3'accepted',_utf8mb3'rejected')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_responses`
--

LOCK TABLES `resume_responses` WRITE;
/*!40000 ALTER TABLE `resume_responses` DISABLE KEYS */;
INSERT INTO `resume_responses` VALUES (1,1,1,'Приглашаем вас на собеседование в Яндекс','accepted','2026-03-02 20:09:48'),(2,1,4,'Рассмотрите вакансию в Ozon','viewed','2026-03-05 20:09:48'),(3,2,2,'Ищем frontend разработчика в Mail.ru','pending','2026-03-07 20:09:48'),(4,3,3,'Отличное резюме, ждем на собеседовании','accepted','2026-02-26 20:09:48'),(5,4,5,'Ищем дизайнера в Wildberries','viewed','2026-03-04 20:09:48'),(6,5,6,'Полный стек - то что нам нужно','pending','2026-03-09 20:09:48'),(7,6,7,'Требуется HR в команду VK','accepted','2026-03-01 20:09:48'),(8,7,8,'DevOps позиция в Тинькофф','rejected','2026-03-06 20:09:48'),(9,8,9,'Аналитик данных в 2ГИС','viewed','2026-03-03 20:09:48'),(10,9,10,'Вакансия тестировщика в Kaspersky','pending','2026-03-08 20:09:48'),(11,10,1,'Project Manager в Яндекс','accepted','2026-02-27 20:09:48'),(12,3,2,'Data Scientist в Mail.ru','viewed','2026-03-04 20:09:48'),(13,5,3,'Fullstack разработчик в Сбер','pending','2026-03-07 20:09:48'),(14,2,4,'Frontend разработчик в Ozon','accepted','2026-02-24 20:09:48'),(15,7,5,'DevOps инженер в Wildberries','rejected','2026-03-05 20:09:48');
/*!40000 ALTER TABLE `resume_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resumes`
--

DROP TABLE IF EXISTS `resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `applicant_id` int DEFAULT NULL,
  `profession_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `salary` int DEFAULT NULL,
  `experience` text,
  `about` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `applicant_id` (`applicant_id`),
  KEY `profession_id` (`profession_id`),
  CONSTRAINT `resumes_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resumes_ibfk_2` FOREIGN KEY (`profession_id`) REFERENCES `professions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resumes`
--

LOCK TABLES `resumes` WRITE;
/*!40000 ALTER TABLE `resumes` DISABLE KEYS */;
INSERT INTO `resumes` VALUES (1,1,1,'Senior Python разработчик',180000,'5 лет разработки на Python, Django, FastAPI','Разрабатывал высоконагруженные сервисы',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(2,2,4,'Frontend разработчик',130000,'3 года с React и Vue.js','Создаю современные интерфейсы',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(3,3,10,'Data Scientist',220000,'6 лет в анализе данных и ML','Опыт построения моделей для бизнеса',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(4,4,13,'UI/UX дизайнер',100000,'4 года в продуктовом дизайне','Проектирую удобные интерфейсы',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(5,5,6,'Fullstack разработчик',170000,'5 лет полного цикла разработки','Fullstack на Python и JavaScript',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(6,6,16,'HR менеджер',85000,'3 года подбора IT специалистов','Закрываю сложные IT вакансии',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(7,7,7,'DevOps инженер',240000,'7 лет в администрировании и DevOps','Kubernetes, CI/CD, мониторинг',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(8,8,9,'Аналитик данных',120000,'4 года анализа данных','SQL, Python, визуализация',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(9,9,17,'QA инженер',90000,'3 года тестирования','Ручное и автотестирование',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(10,10,11,'Project Manager',190000,'8 лет управления проектами','Веду проекты от идеи до релиза',1,'2026-03-11 20:09:48','2026-03-11 20:09:48');
/*!40000 ALTER TABLE `resumes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`user_type` in (_utf8mb3'applicant',_utf8mb3'employer')))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ivan.ivanov@email.com','hash123456','Иван','Иванов','+79001234567','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(2,'petr.petrov@email.com','hash123456','Петр','Петров','+79002345678','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(3,'anna.smirnova@email.com','hash123456','Анна','Смирнова','+79003456789','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(4,'elena.kozlova@email.com','hash123456','Елена','Козлова','+79004567890','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(5,'dmitry.sokolov@email.com','hash123456','Дмитрий','Соколов','+79005678901','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(6,'olga.novikova@email.com','hash123456','Ольга','Новикова','+79006789012','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(7,'mikhail.fedorov@email.com','hash123456','Михаил','Федоров','+79007890123','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(8,'tatyana.morozova@email.com','hash123456','Татьяна','Морозова','+79008901234','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(9,'alexey.volkov@email.com','hash123456','Алексей','Волков','+79009012345','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(10,'natalia.pavlova@email.com','hash123456','Наталья','Павлова','+79000123456','applicant','2026-03-11 20:09:48','2026-03-11 20:09:48'),(11,'hr@yandex.ru','hash123456','Сергей','Яковлев','+79101234567','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(12,'jobs@mail.ru','hash123456','Екатерина','Соколова','+79102345678','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(13,'career@sberbank.ru','hash123456','Андрей','Кузнецов','+79103456789','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(14,'hr@ozon.ru','hash123456','Мария','Попова','+79104567890','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(15,'job@wildberries.ru','hash123456','Денис','Лебедев','+79105678901','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(16,'hr@avito.ru','hash123456','Ксения','Сорокина','+79106789012','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(17,'jobs@vk.ru','hash123456','Павел','Козлов','+79107890123','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(18,'career@tinkoff.ru','hash123456','Алина','Мороз','+79108901234','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(19,'hr@2gis.ru','hash123456','Игорь','Степанов','+79109012345','employer','2026-03-11 20:09:48','2026-03-11 20:09:48'),(20,'jobs@kaspersky.ru','hash123456','Валерия','Орлова','+79100123456','employer','2026-03-11 20:09:48','2026-03-11 20:09:48');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacancies`
--

DROP TABLE IF EXISTS `vacancies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacancies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `profession_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `salary_from` int DEFAULT NULL,
  `salary_to` int DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `employment_type` varchar(50) DEFAULT NULL,
  `experience_required` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `profession_id` (`profession_id`),
  CONSTRAINT `vacancies_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vacancies_ibfk_2` FOREIGN KEY (`profession_id`) REFERENCES `professions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacancies`
--

LOCK TABLES `vacancies` WRITE;
/*!40000 ALTER TABLE `vacancies` DISABLE KEYS */;
INSERT INTO `vacancies` VALUES (1,1,1,'Python разработчик в Яндекс','Разработка высоконагруженных сервисов на Python',200000,350000,'Москва','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(2,1,6,'Fullstack разработчик','Разработка веб-приложений на Python и JavaScript',180000,300000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(3,2,3,'Frontend разработчик','Разработка интерфейсов на React',150000,250000,'Москва','full-time','2-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(4,2,17,'Тестировщик ПО','Ручное и автоматизированное тестирование',120000,180000,'Москва','full-time','1-2 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(5,3,9,'Аналитик данных','Анализ данных, построение отчетов',150000,250000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(6,3,10,'Data Scientist','Разработка моделей машинного обучения',250000,400000,'Москва','full-time','4-6 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(7,4,2,'Java разработчик','Разработка бэкенда для маркетплейса',180000,300000,'Москва','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(8,4,7,'DevOps инженер','Поддержка инфраструктуры, CI/CD',200000,350000,'Москва','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(9,5,13,'UX/UI дизайнер','Проектирование интерфейсов для маркетплейса',130000,220000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(10,5,5,'Backend разработчик','Разработка высоконагруженных систем',180000,300000,'Москва','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(11,6,16,'HR менеджер','Подбор IT специалистов',90000,150000,'Москва','full-time','1-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(12,6,4,'Frontend разработчик (Vue)','Разработка интерфейсов на Vue.js',140000,230000,'Москва','full-time','2-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(13,7,8,'Системный администратор','Администрирование Linux серверов',100000,170000,'Санкт-Петербург','full-time','2-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(14,7,11,'Project Manager','Управление разработкой',180000,300000,'Санкт-Петербург','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(15,8,18,'Android разработчик','Разработка мобильных приложений',180000,300000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(16,8,19,'iOS разработчик','Разработка мобильных приложений',180000,300000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(17,9,1,'Python разработчик','Разработка геосервисов',140000,230000,'Новосибирск','full-time','2-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(18,9,4,'Frontend разработчик','Разработка картографических интерфейсов',130000,220000,'Новосибирск','full-time','2-3 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(19,10,7,'DevOps инженер','Инфраструктура для систем безопасности',200000,350000,'Москва','full-time','3-5 лет',1,'2026-03-11 20:09:48','2026-03-11 20:09:48'),(20,10,17,'Тестировщик безопасности','Тестирование защищенности приложений',150000,250000,'Москва','full-time','2-4 года',1,'2026-03-11 20:09:48','2026-03-11 20:09:48');
/*!40000 ALTER TABLE `vacancies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacancy_responses`
--

DROP TABLE IF EXISTS `vacancy_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacancy_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vacancy_id` int DEFAULT NULL,
  `applicant_id` int DEFAULT NULL,
  `cover_letter` text,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vacancy_applicant` (`vacancy_id`,`applicant_id`),
  KEY `applicant_id` (`applicant_id`),
  CONSTRAINT `vacancy_responses_ibfk_1` FOREIGN KEY (`vacancy_id`) REFERENCES `vacancies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vacancy_responses_ibfk_2` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vacancy_responses_chk_1` CHECK ((`status` in (_utf8mb3'pending',_utf8mb3'viewed',_utf8mb3'accepted',_utf8mb3'rejected')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacancy_responses`
--

LOCK TABLES `vacancy_responses` WRITE;
/*!40000 ALTER TABLE `vacancy_responses` DISABLE KEYS */;
INSERT INTO `vacancy_responses` VALUES (1,1,1,'Здравствуйте! Меня заинтересовала ваша вакансия. Имею большой опыт в Python разработке','accepted','2026-03-01 20:09:48'),(2,2,5,'Хочу попробовать свои силы в вашей компании','viewed','2026-03-04 20:09:48'),(3,3,2,'Отличная вакансия, готов к собеседованию','pending','2026-03-08 20:09:48'),(4,5,8,'Имею большой опыт в анализе данных','accepted','2026-02-24 20:09:48'),(5,7,1,'Интересная задача, хочу поработать с Java','rejected','2026-03-06 20:09:48'),(6,9,4,'Могу быть полезен в дизайне интерфейсов','pending','2026-03-09 20:09:48'),(7,11,6,'Имею опыт подбора IT специалистов','viewed','2026-03-07 20:09:48'),(8,13,7,'Хочу попробовать себя в системном администрировании','accepted','2026-02-27 20:09:48'),(9,15,1,'Интересно попробовать мобильную разработку','pending','2026-03-10 20:09:48'),(10,17,1,'Рассматриваю вакансии в Новосибирске','viewed','2026-03-05 20:09:48'),(11,2,3,'Могу быть полезен в fullstack разработке','rejected','2026-03-03 20:09:48'),(12,4,9,'Опыт тестирования более 3 лет','accepted','2026-02-25 20:09:48'),(13,6,3,'Data Science - моя специализация','pending','2026-03-08 20:09:48'),(14,8,7,'Отличная вакансия для DevOps','viewed','2026-03-06 20:09:48'),(15,10,5,'Много лет занимаюсь backend разработкой','accepted','2026-02-28 20:09:48');
/*!40000 ALTER TABLE `vacancy_responses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11 23:14:41
