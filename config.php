<?php
// Konfigurasi database
$host = 'localhost';
$dbname = 'voicescript';
$username = 'root';
$password = '';

// Atur session agar lebih stabil dan tidak expire terlalu cepat
ini_set('session.gc_maxlifetime', 28800); // 8 jam
ini_set('session.cookie_lifetime', 28800);
session_set_cookie_params([
    'lifetime' => 28800,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// Start session dengan aman
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Koneksi database dengan PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal']));
}

// Helper function untuk cek apakah user sudah login
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Helper function untuk memerlukan login (redirect ke login jika belum)
function requireLogin() {
    header('Content-Type: application/json');
    if (!isLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Silakan login terlebih dahulu', 'loggedIn' => false]);
        exit;
    }
}

// Helper function untuk mendapatkan user yang sedang login
function getCurrentUser() {
    global $pdo;
    if (!isLoggedIn()) return null;
    
    $stmt = $pdo->prepare("SELECT id, username, email, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}
