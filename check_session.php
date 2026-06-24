<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

if (isLoggedIn()) {
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode(['success' => false]);
}
?>
