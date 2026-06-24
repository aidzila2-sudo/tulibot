<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

session_destroy();
echo json_encode(['success' => true]);
?>
