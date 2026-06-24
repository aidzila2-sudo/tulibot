<?php
require_once '../includes/config.php';

header('Content-Type: application/json');
requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, text_content, language_used, control_method, created_at FROM transcripts WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$_SESSION['user_id']]);
    $transcripts = $stmt->fetchAll();
    echo json_encode(['success' => true, 'transcripts' => $transcripts]);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO transcripts (user_id, text_content, language_used, control_method) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $_SESSION['user_id'],
        $data['text_content'],
        $data['language_used'],
        $data['control_method'] ?? 'manual'
    ]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM transcripts WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['id'], $_SESSION['user_id']]);
    
    echo json_encode(['success' => true]);
}
?>
