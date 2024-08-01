<?php
// Load Composer's autoloader
require __DIR__ . '../../../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Get the environment variables
$EMAIL = $_ENV['EMAIL'] ?? null;
$PASSWORD = $_ENV['PASSWORD'] ?? null;

// Check if EMAIL and PASSWORD are set
if (!$EMAIL || !$PASSWORD) {
    die("Environment variables EMAIL and PASSWORD must be set in the .env file.");
}

// Capture POST data
$reporterName = $_POST["reporterName"] ?? null;
if (!(isset($reporterName))){
    $reporterName = $_POST["installContactName"];
}
$reporterEmail = $_POST["reporterEmail"] ?? null;
if (!(isset($reporterEmail))){
    $reporterEmail = $_POST["installContactEmail"];
}

$requestType = $_POST["requestType"] ?? null;

// Common fields
$onsite_contact_name = $_POST["onsiteContactName"] ?? null;
$onsite_contact_mobile = $_POST["onsiteContactMobile"] ?? null;
$onsite_contact_email = $_POST["onsiteContactEmail"] ?? null;

// Validate email address
if (empty($reporterEmail) || !filter_var($reporterEmail, FILTER_VALIDATE_EMAIL)) {
    die("A valid email address must be provided.");
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$mail = new PHPMailer(true);

try {
    // Enable SMTP debugging
    //$mail->SMTPDebug = SMTP::DEBUG_SERVER;

    // Set mailer to use SMTP
    $mail->isSMTP();
    $mail->SMTPAuth = true;

    // Set SMTP server and authentication details
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Provide username and password for SMTP authentication
    $mail->Username = $EMAIL;
    $mail->Password = $PASSWORD;

    // Set sender and recipient details
    $mail->setFrom($EMAIL, 'Virtual Doorman');
    $mail->addAddress($reporterEmail, $reporterName);

    // Prepare the email body
    $body = "Hello $reporterName,\n\n";
    $service_repair_date = $_POST["serviceRepairDate"] ?? null;
    if (isset($service_repair_date)) {
        $mail->Subject = "Virtual Doorman Service Ticket Confirmed";
        $mail->addAddress($onsite_contact_email, $onsite_contact_name);
        $complaint_details = $_POST["complaintDetails"] ?? null;
        $reporter_mobile = $_POST["reporterMobile"] ?? null;
        $reporter_email = $_POST["reporterEmail"] ?? null;
        $service_repair_asap = isset($_POST["serviceRepairASAP"]) ? 'Yes' : 'No';
        
        $body .= "We have received your service repair ticket with the following details:\n\n";
        $body .= "Reporter's Name: $reporterName\n";
        $body .= "Complaint Details: $complaint_details\n";
        $body .= "Reporter's Mobile: $reporter_mobile\n";
        $body .= "Reporter's Email: $reporter_email\n";
        $body .= "Onsite Contact Name: $onsite_contact_name\n";
        $body .= "Onsite Contact Mobile: $onsite_contact_mobile\n";
        $body .= "Onsite Contact Email: $onsite_contact_email\n";
        $body .= "Preferred Service Repair Date: $service_repair_date\n";
        $body .= "ASAP: $service_repair_asap\n";
    }  else {
        $mail->Subject = "Virtual Doorman Installation Ticket Confirmed";
        $installContactName = $_POST["installContactName"];
        $installContactMobile = $_POST["installContactMobile"];
        $installContactEmail = $_POST["installContactEmail"];
        $preferred_date = $_POST["preferredDate"] ?? null;
        $installation_asap = isset($_POST["installationASAP"]) ? 'Yes' : 'No';
        $expected_cost = $_POST["expectedCost"] ?? null;
        $install_details = $_POST["installDetails"] ?? null;
        
        $body .= "We have received your installation ticket with the following details:\n\n";
        $body .= "Onsite Contact Name: $installContactName\n";
        $body .= "Onsite Contact Mobile: $installContactMobile\n";
        $body .= "Onsite Contact Email: $installContactEmail\n";
        $body .= "Preferred Installation Date: $preferred_date\n";
        $body .= "ASAP: $installation_asap\n";
        $body .= "Expected Total Cost of Ownership: $$expected_cost\n";
        $body .= "Details of What to Install: $install_details\n";
    } 

    $body .= "\nWe will get back to you within 24 hours with further details.";

    $mail->Body = $body;

    $mail->send();

    // Redirect to the confirmation page
    header("Location: /public/html/email_sent/sent.html");
    exit();
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>
