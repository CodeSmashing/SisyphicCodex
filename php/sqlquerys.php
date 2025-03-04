<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/php/config.php";

function sqlCreateTable($pdo) {
    try {
        $sql = "CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(255) NOT NULL, user_password VARCHAR(255) NOT NULL, user_creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return true;
    } catch (PDOException $e) {
        error_log("Error creating users table: " . $e->getMessage());
        return false;
    }
}

function sqlSelectUserList($pdo) {
    try {
        $sql = "SELECT * FROM users";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error collecting user table information: " . $e->getMessage());
        return false;
    }
}

function sqlSelectUser($pdo, $id) {
    try {
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error collecting user information: " . $e->getMessage());
        return false;
    }
}

function sqlInsertUser($pdo, $input_username, $hash) {
    try {
        $sql = "INSERT INTO users (name, password) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$input_username, $hash]);

        $lastInsertId = $pdo->lastInsertId();
        return sqlSelectUser($pdo, $lastInsertId);
    } catch (PDOException $e) {
        error_log("Error inserting user information into database: " . $e->getMessage());
        return false;
    }
}

function sqlUpdateUser($pdo, $input_username, $hash) {
    try {
        $sql = "UPDATE users SET password = ? WHERE name = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$hash, $input_username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error updating user information in database: " . $e->getMessage());
        return false;
    }
}
