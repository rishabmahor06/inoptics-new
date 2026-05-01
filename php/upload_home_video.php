<?php
// ===== SECURITY & CORS =====
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://inoptics.in',
    'https://www.inoptics.in',
    'http://localhost:3000',
    'http://localhost:5173',
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===== DB CONNECTION =====
$conn = new mysqli(
    "localhost",
    "inoptics_inoptics_user",
    "india@2026A$",
    "inoptics_inoptics_login"
);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed"]);
    exit;
}

// ===== Helper: convert YouTube/Vimeo URL → embeddable URL =====
function normalize_video_url($url) {
    $url = trim($url);
    if ($url === '') return null;

    // YouTube watch / share / shorts / embed
    if (preg_match('~youtu\.be/([\w\-]+)~',                  $url, $m) ||
        preg_match('~youtube\.com/watch\?.*v=([\w\-]+)~',    $url, $m) ||
        preg_match('~youtube\.com/embed/([\w\-]+)~',         $url, $m) ||
        preg_match('~youtube\.com/shorts/([\w\-]+)~',        $url, $m)) {
        return "https://www.youtube.com/embed/{$m[1]}?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playlist={$m[1]}";
    }

    // Vimeo
    if (preg_match('~vimeo\.com/(\d+)~', $url, $m)) {
        return "https://player.vimeo.com/video/{$m[1]}?autoplay=1&loop=1&muted=1&controls=0&background=1";
    }

    // Direct video file URL — keep as-is
    return $url;
}

$video_path = null;

// ===== 1. JSON BODY (link upload from frontend) =====
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    if (!empty($body['video_url'])) {
        $video_path = normalize_video_url($body['video_url']);
    }
}

// ===== 2. multipart/form-data — file upload =====
if (!$video_path && isset($_FILES['video']) && $_FILES['video']['size'] > 0) {
    $video    = $_FILES['video'];
    $ext      = strtolower(pathinfo($video['name'], PATHINFO_EXTENSION));
    $allowed  = ['mp4', 'webm', 'ogg', 'mov'];

    if (!in_array($ext, $allowed)) {
        echo json_encode(["error" => "Invalid video format"]);
        exit;
    }

    $filename   = time() . '_home_video.' . $ext;
    $uploadDir  = __DIR__ . "/uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $uploadPath = $uploadDir . $filename;

    if (move_uploaded_file($video['tmp_name'], $uploadPath)) {
        $video_path = "uploads/" . $filename;
    } else {
        echo json_encode(["error" => "Failed to upload video"]);
        exit;
    }
}

// ===== 3. multipart/form-data — link via $_POST (fallback) =====
if (!$video_path && !empty($_POST['video_url'])) {
    $video_path = normalize_video_url($_POST['video_url']);
}

// ===== VALIDATION =====
if (!$video_path) {
    echo json_encode(["error" => "Please upload video or provide URL"]);
    exit;
}

// ===== INSERT =====
$stmt = $conn->prepare("INSERT INTO home_page_videos (video_path) VALUES (?)");
$stmt->bind_param("s", $video_path);

if ($stmt->execute()) {
    echo json_encode([
        "message"    => "Video saved successfully",
        "video_path" => $video_path,
    ]);
} else {
    echo json_encode(["error" => "Database insert failed"]);
}

$stmt->close();
$conn->close();
