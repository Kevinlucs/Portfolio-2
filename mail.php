<?php
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// Carregar variáveis do .env
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$title = "Portfólio | Contato";
$name = htmlspecialchars($_POST['name'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars($_POST['message'] ?? '');

if (!$email) {
  http_response_code(400);
  echo "Email inválido.";
  exit;
}

$subject = "Portfólio | Contato";
$body = "
    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;\">
        <h2 style=\"color: #333; text-align: center;\">📩 Nova mensagem do seu portfólio</h2>
        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\" />
        <p><strong>👤 Nome:</strong> {$name}</p>
        <p><strong>📧 E-mail:</strong> <a href=\"mailto:{$email}\">{$email}</a></p>
        <p><strong>📝 Mensagem:</strong></p>
        <div style=\"padding: 12px; background-color: #fff; border: 1px solid #ddd; border-radius: 6px;\">
            <p>" . nl2br($message) . "</p>
        </div>
        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\" />
        <p style=\"text-align: center; font-size: 12px; color: #999;\">Este e-mail foi enviado via <a href=\"https://kevinlucas.com.br\">kevinlucas.com.br</a></p>
    </div>
";

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->CharSet = "UTF-8";
  $mail->SMTPAuth = true;
  $mail->Host = $_ENV['MAIL_HOST'];
  $mail->Username = $_ENV['MAIL_USERNAME'];
  $mail->Password = $_ENV['MAIL_PASSWORD'];
  $mail->SMTPSecure = 'ssl';
  $mail->Port = $_ENV['MAIL_PORT'];

  $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
  $mail->addReplyTo($email, $name);
  $mail->addAddress($_ENV['MAIL_TO']);
  $mail->isHTML(true);
  $mail->Subject = $subject;
  $mail->Body = $body;

  $mail->send();
  http_response_code(200);
  echo "Mensagem enviada com sucesso!";
} catch (Exception $e) {
  http_response_code(500);
  echo "Erro ao enviar: {$mail->ErrorInfo}";
}
