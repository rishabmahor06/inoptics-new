<?php
// =========================================================================
// Contact Form Submit — reCAPTCHA v3 verified + email via PHP mail()
// Endpoint: https://inoptics.in/api/submit_contact_form.php
// =========================================================================

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

/* ===== CORS ===== */
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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

/* ===== reCAPTCHA secret =====
 * IMPORTANT: Replace with the SECRET KEY (not site key) from
 * https://www.google.com/recaptcha/admin/site/...
 *
 * Site key   = 6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu  (used in frontend)
 * Secret key = goes here ↓
 */
$RECAPTCHA_SECRET = 'YOUR_RECAPTCHA_SECRET_KEY_HERE';
$RECAPTCHA_MIN_SCORE = 0.3;       // 0.0 = bot, 1.0 = human
$RECAPTCHA_REQUIRED  = false;     // set true when secret key is configured

/* ===== Helper: respond + exit ===== */
function respond($success, $message, $extra = []) {
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $extra));
    exit;
}

/* ===== Read input (FormData/multipart) ===== */
$from_email = trim($_POST['from_email']      ?? '');
$from_name  = trim($_POST['from_name']       ?? '');
$message    = trim($_POST['message']         ?? '');
$mobile     = trim($_POST['mobile']          ?? '');
$company    = trim($_POST['company']         ?? '');
$to_email   = trim($_POST['to_email']        ?? 'support@inoptics.in');
$token      = trim($_POST['recaptcha_token'] ?? '');

/* ===== Basic validation ===== */
if ($from_name === '' || $from_email === '' || $message === '' || $mobile === '' || $company === '') {
    respond(false, 'Please fill all required fields');
}
if (!filter_var($from_email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email address');
}

/* ===== reCAPTCHA verification ===== */
if ($token !== '' && $RECAPTCHA_SECRET !== 'YOUR_RECAPTCHA_SECRET_KEY_HERE') {
    $verifyData = http_build_query([
        'secret'   => $RECAPTCHA_SECRET,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);

    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $verifyData,
            'timeout' => 10,
        ],
    ]);

    $verifyResp = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $ctx);
    $verify     = $verifyResp ? json_decode($verifyResp, true) : null;

    if (!$verify || empty($verify['success'])) {
        $err = $verify['error-codes'][0] ?? 'unknown';
        error_log("reCAPTCHA failed: $err");
        respond(false, "reCAPTCHA verification failed ($err)");
    }

    if (isset($verify['score']) && $verify['score'] < $RECAPTCHA_MIN_SCORE) {
        error_log("reCAPTCHA low score: " . $verify['score']);
        respond(false, 'Suspicious activity detected. Please try again.');
    }
} elseif ($RECAPTCHA_REQUIRED) {
    respond(false, 'reCAPTCHA token missing');
}
// else: token absent OR secret unset — skip silently (dev-friendly)

/* ===== Send email ===== */
$subject = "InOptics Contact Form — $from_name from $company";
$body    = "Name: $from_name\n"
         . "Email: $from_email\n"
         . "Mobile: $mobile\n"
         . "Company: $company\n\n"
         . "Message:\n$message\n";
$headers = "From: InOptics <noreply@inoptics.in>\r\n"
         . "Reply-To: $from_name <$from_email>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to_email, $subject, $body, $headers);

if (!$sent) {
    error_log("mail() failed for $to_email");
    respond(false, 'Failed to send email. Please try again later.');
}

respond(true, 'Message sent successfully!');
