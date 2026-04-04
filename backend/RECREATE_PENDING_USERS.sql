-- 🔧 RECREATE PENDING_USERS TABLE
-- Run this SQL in PhpMyAdmin if the pending_users table was deleted

-- Check if table exists and create it
CREATE TABLE IF NOT EXISTS pending_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    departement VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT,
    rejection_reason TEXT,
    processed_at TIMESTAMP NULL,
    processed_by INT,
    INDEX (email),
    INDEX (status),
    INDEX (departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify it was created
SELECT
    'pending_users' as table_name,
    COUNT(*) as record_count,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM information_schema.TABLES
LEFT JOIN information_schema.COLUMNS
    ON TABLES.TABLE_NAME = COLUMNS.TABLE_NAME
WHERE TABLES.TABLE_SCHEMA = DATABASE()
    AND TABLES.TABLE_NAME = 'pending_users'
GROUP BY TABLES.TABLE_NAME;
