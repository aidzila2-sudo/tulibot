<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Handle resend verification code
if (isset($data['resend']) && $data['resend'] === true) {
    if (!isset($data['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit;
    }
    
    $email = trim($data['email']);
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan']);
            exit;
        }
        
        // Generate new verification code
        $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $verification_expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        
        $updateStmt = $pdo->prepare("UPDATE users SET verification_code = ?, verification_expires_at = ? WHERE id = ?");
        $updateStmt->execute([$verification_code, $verification_expires_at, $user['id']]);
        
        // Log verification code for demo purposes
        error_log("Verification code for {$email}: {$verification_code}");
        
        echo json_encode([
            'success' => true, 
            'message' => 'Kode verifikasi baru telah dikirim! (Lihat log server untuk demo)'
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
    exit;
}

// Handle registration
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = $data['password'];

// Validate username
if (strlen($username) < 3) {
    echo json_encode(['success' => false, 'message' => 'Username harus minimal 3 karakter']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email tidak valid']);
    exit;
}

// Validate password
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password harus minimal 6 karakter']);
    exit;
}

try {
    // Check if username already exists
    $checkUsername = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $checkUsername->execute([$username]);
    if ($checkUsername->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Username sudah terdaftar']);
        exit;
    }
    
    // Check if email already exists
    $checkEmail = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $checkEmail->execute([$email]);
    if ($checkEmail->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar']);
        exit;
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Generate verification code
    $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $verification_expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    
    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, verification_code, verification_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, 0)");
    $stmt->execute([$username, $email, $hashed_password, $verification_code, $verification_expires_at]);
    
    // Log verification code for demo purposes
    error_log("Verification code for {$email}: {$verification_code}");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Pendaftaran berhasil! Silakan verifikasi email Anda (Lihat log server untuk demo)'
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
