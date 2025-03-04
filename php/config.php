<?php
$servername = "";
$db_username = "";
$db_password = "";
$db_name = "";
$charset = "utf8mb4";

try {
    // Create a PDO object and set the connection parameters
    $dsn = "mysql:host=$servername;dbname=$db_name;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    $pdo = new PDO($dsn, $db_username, $db_password, $options);
} catch (PDOException $e) {
    // Handle any errors that may occur during connection
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
