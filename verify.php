<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['code'])) {
    echo json_encode(['success' => false, 'message' => 'Email and verification code are required']);
    exit;
}

$email = trim($data['email']);
$code = trim($data['code']);

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan']);
        exit;
    }
    
    // Check if already verified
    if ($user['is_verified']) {
        echo json_encode(['success' => true, 'message' => 'Email Anda sudah terverifikasi! Silakan login']);
        exit;
    }
    
    // Check verification code
    if ($user['verification_code'] !== $code) {
        echo json_encode(['success' => false, 'message' => 'Kode verifikasi salah']);
        exit;
    }
    
    // Check if code is expired
    $current_time = date('Y-m-d H:i:s');
    if ($current_time > $user['verification_expires_at']) {
        echo json_encode(['success' => false, 'message' => 'Kode verifikasi sudah kedaluwarsa! Silakan kirim ulang kode']);
        exit;
    }
    
    // Verify user
    $updateStmt = $pdo->prepare("UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    echo json_encode(['success' => true, 'message' => 'Verifikasi berhasil! Silakan login']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
