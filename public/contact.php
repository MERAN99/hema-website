<?php
/**
 * Contact form handler for the Hema Company website.
 * Sends the visitor's message to info@hemacompany.com with PHP mail().
 * Accepts POST as JSON or as normal form fields. Returns JSON {ok:true} or {ok:false,error}.
 */

const TO_EMAIL   = 'info@hemacompany.com';
const FROM_EMAIL = 'info@hemacompany.com';
const FROM_NAME  = 'Hema Website';
const RATE_LIMIT_SECONDS = 30; // one message per visitor every 30 seconds...
const RATE_LIMIT_HOURLY  = 5;  // ...and at most 5 per hour
const ALLOWED_ORIGINS = ['https://hemacompany.com', 'https://www.hemacompany.com'];
// Cloudflare Turnstile secret, kept outside public_html. If the file is missing the bot check is skipped.
const TURNSTILE_SECRET_FILE = __DIR__ . '/../turnstile-secret.txt';

// The site sits behind Cloudflare, so REMOTE_ADDR is a Cloudflare server. The visitor's real address is in
// CF-Connecting-IP, which is trusted only when the request really came from Cloudflare.
// Ranges from https://www.cloudflare.com/ips/ (they change rarely).
const CLOUDFLARE_RANGES = [
    '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
    '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
    '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
    '2a06:98c0::/29', '2c0f:f248::/32',
];

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function ip_in_range(string $ip, string $cidr): bool {
    [$net, $bits] = explode('/', $cidr);
    $ipBin = @inet_pton($ip);
    $netBin = @inet_pton($net);
    if ($ipBin === false || $netBin === false || strlen($ipBin) !== strlen($netBin)) return false;
    $bits = (int) $bits;
    $bytes = intdiv($bits, 8);
    if (substr($ipBin, 0, $bytes) !== substr($netBin, 0, $bytes)) return false;
    $rest = $bits % 8;
    if ($rest === 0) return true;
    $mask = chr((0xFF << (8 - $rest)) & 0xFF);
    return (($ipBin[$bytes] & $mask) === ($netBin[$bytes] & $mask));
}

function visitor_ip(): string {
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) {
        foreach (CLOUDFLARE_RANGES as $range) {
            if (ip_in_range($remote, $range)) return $cf;
        }
    }
    return $remote !== '' ? $remote : 'unknown';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Only accept posts sent from our own pages (browsers always send Origin on these requests).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ALLOWED_ORIGINS, true)) {
    respond(403, ['ok' => false, 'error' => 'forbidden']);
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
$turnstile = $field('turnstile', 2048);

// Bots fill the hidden "website" field; pretend success so they don't retry.
if ($honeypot !== '') respond(200, ['ok' => true]);

if ($name === '')    respond(422, ['ok' => false, 'error' => 'name_required']);
if ($message === '') respond(422, ['ok' => false, 'error' => 'message_required']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, ['ok' => false, 'error' => 'invalid_email']);
if ($phone !== '' && !preg_match('/^\+?[0-9\x{0660}-\x{0669}\x{06F0}-\x{06F9}\s().-]{6,30}$/u', $phone)) {
    respond(422, ['ok' => false, 'error' => 'invalid_phone']);
}

// Per-visitor rate limit: the times of recent messages are kept in a small temp file.
$ip = visitor_ip();
$stamp = sys_get_temp_dir() . '/hema_contact_' . md5($ip);
$now = time();
$recent = is_file($stamp) ? json_decode((string) @file_get_contents($stamp), true) : [];
$recent = array_values(array_filter(is_array($recent) ? $recent : [], fn($t) => is_int($t) && $now - $t < 3600));
if (($recent && $now - max($recent) < RATE_LIMIT_SECONDS) || count($recent) >= RATE_LIMIT_HOURLY) {
    respond(429, ['ok' => false, 'error' => 'too_many_requests']);
}

// Cloudflare Turnstile bot check, when the secret file is in place.
if (is_readable(TURNSTILE_SECRET_FILE)) {
    $secret = trim((string) file_get_contents(TURNSTILE_SECRET_FILE));
    if ($secret !== '') {
        if ($turnstile === '') respond(403, ['ok' => false, 'error' => 'bot_check_failed']);
        $ctx = stream_context_create(['http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query(['secret' => $secret, 'response' => $turnstile, 'remoteip' => $ip]),
            'timeout' => 10,
        ]]);
        $verify = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $ctx);
        $result = $verify ? json_decode($verify, true) : null;
        if (!is_array($result) || empty($result['success'])) {
            respond(403, ['ok' => false, 'error' => 'bot_check_failed']);
        }
    }
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

$recent[] = $now;
@file_put_contents($stamp, json_encode($recent), LOCK_EX);
respond(200, ['ok' => true]);
