-- Таблица пользователей (общая для соискателей и работодателей)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('applicant', 'employer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица соискателей (дополнительная информация)
CREATE TABLE applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    birth_date DATE,
    city VARCHAR(100),
    about TEXT,
    expected_salary INT,
    experience_years INT,
    education VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица компаний (работодателей)
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    city VARCHAR(100),
    employees_count VARCHAR(50),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица вакансий (создаются компаниями)
CREATE TABLE vacancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_from INT,
    salary_to INT,
    city VARCHAR(100),
    employment_type VARCHAR(50),
    experience_required VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Таблица резюме (создаются соискателями)
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT,
    title VARCHAR(255) NOT NULL,
    profession VARCHAR(255),
    salary INT,
    experience TEXT,
    about TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Таблица откликов соискателей на вакансии
CREATE TABLE vacancy_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vacancy_id INT,
    applicant_id INT,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vacancy_applicant (vacancy_id, applicant_id),
    CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected'))
);

-- Таблица откликов работодателей на резюме (приглашения)
CREATE TABLE resume_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT,
    company_id INT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_resume_company (resume_id, company_id),
    CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected'))
);