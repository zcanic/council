-- 初始化数据库
CREATE DATABASE IF NOT EXISTS parliament_loop;
USE parliament_loop;

-- 设置字符集
ALTER DATABASE parliament_loop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（如果docker-compose中的用户未创建）
-- CREATE USER IF NOT EXISTS 'parliament_user'@'%' IDENTIFIED BY 'parliament_pass_2024';
-- GRANT ALL PRIVILEGES ON parliament_loop.* TO 'parliament_user'@'%';
-- FLUSH PRIVILEGES;