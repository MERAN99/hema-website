<?php
/**
 * Contact form handler for the Hema Company website.
 * Sends the visitor's message to info@hemacompany.com with PHP mail().
 * Accepts POST as JSON or as normal form fields. Returns JSON {ok:true} or {ok:false,error}.
 */

const TO_EMAIL   = 'info@hemacompany.com';
const FROM_EMAIL = 'info@hemacompany.com';
const FROM_NAME  = 'Hema Website';
const RATE_LIMIT_SECONDS = 30; // one message per IP every 30 seconds

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Read JSON body, or fall back to form fields.
$data = $_POST;
$type = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($type, 'application/json') !== false) {
    $raw = file_get_contents('php://input', false, null, 0, 65536);
    $json = json_decode($raw ?: '', true);
    if (!is_array($json)) respond(400, ['ok' => false, 'error' => 'invalid_json']);
    $data = $json;
}

$field = function (string $key, int $max) use ($data): string {
    $v = isset($data[$key]) && is_scalar($data[$key]) ? trim((string) $data[$key]) : '';
    return mb_substr($v, 0, $max, 'UTF-8');
};
// Header values must never contain line breaks (header injection).
$oneLine = fn(string $v): string => trim(preg_replace('/[\r\n]+/', ' ', $v));

$name     = $oneLine($field('name', 200));
$email    = $oneLine($field('email', 254));
$phone    = $oneLine($field('phone', 50));
$subject  = $oneLine($field('subject', 200));
$message  = $field('message', 10000);
$honeypot = $field('website', 200);

// Bots fill the hidden "website" field; pretend success so they don't retry.
if ($honeypot !== '') respond(200, ['ok' => true]);

if ($name === '')    respond(422, ['ok' => false, 'error' => 'name_required']);
if ($message === '') respond(422, ['ok' => false, 'error' => 'message_required']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, ['ok' => false, 'error' => 'invalid_email']);

// Simple per-IP rate limit using a temp file.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = sys_get_temp_dir() . '/hema_contact_' . md5($ip);
if (is_file($stamp) && time() - (int) @filemtime($stamp) < RATE_LIMIT_SECONDS) {
    respond(429, ['ok' => false, 'error' => 'too_many_requests']);
}

if ($subject === '') $subject = 'Website enquiry';
$subject = $subject . ' - ' . $name;

$body = "New message from the Hema Company website\n"
      . "-----------------------------------------\n"
      . "Name:  $name\n"
      . "Email: $email\n"
      . ($phone !== '' ? "Phone: $phone\n" : '')
      . "\n"
      . $message . "\n";

$encode = fn(string $v): string => '=?UTF-8?B?' . base64_encode($v) . '?=';

$headers = implode("\r\n", [
    'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $encode($name) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Hema-Website',
]);

$sent = @mail(TO_EMAIL, $encode($subject), $body, $headers, '-f' . FROM_EMAIL);

if (!$sent) respond(500, ['ok' => false, 'error' => 'send_failed']);

@touch($stamp);
respond(200, ['ok' => true]);
