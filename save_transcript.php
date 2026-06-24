<?php
// Konfigurasi database (mudah di-edit untuk hosting)
$host = 'localhost';
$dbname = 'voicescript';
$username = 'root';
$password = '';

// Atur header untuk JSON
header('Content-Type: application/json');

// Koneksi database dengan PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $e->getMessage()]);
    exit;
}

// Cek apakah request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Metode request tidak valid']);
    exit;
}

// Ambil data JSON dari request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validasi data
if (!isset($data['user_id']) || !isset($data['text_content']) || !isset($data['language_used']) || !isset($data['control_method'])) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
    exit;
}

// Insert ke database
try {
    $stmt = $pdo->prepare("
        INSERT INTO transcripts (user_id, text_content, language_used, control_method)
        VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['user_id'],
        $data['text_content'],
        $data['language_used'],
        $data['control_method']
    ]);
    
    echo json_encode(['status' => 'success', 'message' => 'Transkrip berhasil disimpan', 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan transkrip: ' . $e->getMessage()]);
    exit;
}
