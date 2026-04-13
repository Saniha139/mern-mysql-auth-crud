CREATE DATABASE mern_auth_db;
USE mern_auth_db;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 email VARCHAR(100),
 password VARCHAR(255)
);

CREATE TABLE items (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 title VARCHAR(255),
 description TEXT
);