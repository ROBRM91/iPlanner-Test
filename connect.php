<?php
// Recibe los datos del formulario POST
$servername = $_POST['server_name'];
$username = $_POST['user_name'];
$password = $_POST['password'];
$dbname = $_POST['db_name'];
$serverport = $_POST['server_port'];

// Crea una conexión usando MySQLi
$conn = new mysqli($servername, $username, $password, $dbname, $serverport);

// Verifica si la conexión fue exitosa
if ($conn->connect_error) {
    die("❌ ¡Error de conexión!: " . $conn->connect_error);
} else {
    // Redirige al usuario a la página de catálogos
    echo "✅ ¡Conexión exitosa a la base de datos **" . $dbname . "**!";
    header("Location: iplanner-catalogos.html");
    exit(); // Es importante usar exit() después de una redirección
}
?>
