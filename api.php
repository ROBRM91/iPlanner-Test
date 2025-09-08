<?php
header('Content-Type: application/json');

// Credenciales de conexión
/*$servername = "localhost";
$username = "root";
$password = "";
$dbname = "budgetmaster";*/

$servername = "hopper.proxy.rlwy.net";
$username = "root";
$password = "bAXbctkLKIfxpHxwyrLfSNzbjEjhiovY";
$dbname = "railway";
$serverport = "48142";

// Crea la conexión
$conn = new mysqli($servername, $username, $password, $dbname, $serverport);

// Verifica la conexión
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conn->connect_error]));
}

$response = ['success' => false, 'data' => null, 'message' => 'Acción no válida.'];

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'getTiposMovimiento':
            $sql = "SELECT id, nombre FROM tipos_movimiento";
            $result = $conn->query($sql);
            $data = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $response = ['success' => true, 'data' => $data, 'message' => 'Tipos de movimiento obtenidos con éxito.'];
            } else {
                $response = ['success' => true, 'data' => [], 'message' => 'No se encontraron registros.'];
            }
            break;

        case 'getTiposCosto':
            $sql = "SELECT tc.id, tc.nombre, tc.id_tipo_movimiento, tm.nombre as tipo_movimiento FROM tipos_costo tc INNER JOIN tipos_movimiento tm ON tc.id_tipo_movimiento = tm.id";
            $result = $conn->query($sql);
            $data = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $response = ['success' => true, 'data' => $data, 'message' => 'Tipos de costo obtenidos con éxito.'];
            } else {
                $response = ['success' => true, 'data' => [], 'message' => 'No se encontraron registros.'];
            }
            break;

        case 'getCategorias':
            $sql = "SELECT c.id, c.nombre, c.id_tipo_movimiento, c.id_tipo_costo, tm.nombre as tipo_movimiento, tc.nombre as tipo_costo FROM categorias c INNER JOIN tipos_movimiento tm ON c.id_tipo_movimiento = tm.id INNER JOIN tipos_costo tc ON c.id_tipo_costo = tc.id";
            $result = $conn->query($sql);
            $data = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $response = ['success' => true, 'data' => $data, 'message' => 'Categorías obtenidas con éxito.'];
            } else {
                $response = ['success' => true, 'data' => [], 'message' => 'No se encontraron registros.'];
            }
            break;
            
        case 'getConceptos':
            $sql = "SELECT co.id, co.nombre, co.id_categoria, c.nombre as categoria, tm.nombre as tipo_movimiento, tc.nombre as tipo_costo FROM conceptos co INNER JOIN categorias c ON co.id_categoria = c.id INNER JOIN tipos_costo tc ON c.id_tipo_costo = tc.id INNER JOIN tipos_movimiento tm ON c.id_tipo_movimiento = tm.id";
            $result = $conn->query($sql);
            $data = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $response = ['success' => true, 'data' => $data, 'message' => 'Conceptos obtenidos con éxito.'];
            } else {
                $response = ['success' => true, 'data' => [], 'message' => 'No se encontraron registros.'];
            }
            break;
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    switch ($action) {
        // Lógica para Tipos de Movimiento
        case 'addTipoMovimiento':
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $sql = "INSERT INTO tipos_movimiento (nombre) VALUES ('$nombre')";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Tipo de movimiento agregado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'editTipoMovimiento':
            $id = (int)$_POST['id'];
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $sql = "UPDATE tipos_movimiento SET nombre = '$nombre' WHERE id = $id";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Tipo de movimiento actualizado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'deleteTipoMovimiento':
            $id = (int)$_POST['id'];
            $checkSql = "SELECT COUNT(*) as count FROM tipos_costo WHERE id_tipo_movimiento = $id";
            $checkResult = $conn->query($checkSql)->fetch_assoc();
            if ($checkResult['count'] > 0) {
                $response = ['success' => false, 'message' => 'No se puede eliminar. Existen tipos de costo enlazados a este tipo de movimiento.'];
            } else {
                $sql = "DELETE FROM tipos_movimiento WHERE id = $id";
                if ($conn->query($sql) === TRUE) {
                    $response = ['success' => true, 'message' => 'Tipo de movimiento eliminado con éxito.'];
                } else {
                    $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
                }
            }
            break;
        
        // Lógica para Tipos de Costo
        case 'addTipoCosto':
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_tipo_movimiento = (int)$_POST['id_tipo_movimiento'];
            $sql = "INSERT INTO tipos_costo (nombre, id_tipo_movimiento) VALUES ('$nombre', $id_tipo_movimiento)";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Tipo de costo agregado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'editTipoCosto':
            $id = (int)$_POST['id'];
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_tipo_movimiento = (int)$_POST['id_tipo_movimiento'];
            $sql = "UPDATE tipos_costo SET nombre = '$nombre', id_tipo_movimiento = $id_tipo_movimiento WHERE id = $id";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Tipo de costo actualizado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'deleteTipoCosto':
            $id = (int)$_POST['id'];
            $checkSql = "SELECT COUNT(*) as count FROM categorias WHERE id_tipo_costo = $id";
            $checkResult = $conn->query($checkSql)->fetch_assoc();
            if ($checkResult['count'] > 0) {
                $response = ['success' => false, 'message' => 'No se puede eliminar. Existen categorías enlazadas a este tipo de costo.'];
            } else {
                $sql = "DELETE FROM tipos_costo WHERE id = $id";
                if ($conn->query($sql) === TRUE) {
                    $response = ['success' => true, 'message' => 'Tipo de costo eliminado con éxito.'];
                } else {
                    $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
                }
            }
            break;
            
        // Lógica para Categorías
        case 'addCategoria':
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_tipo_movimiento = (int)$_POST['id_tipo_movimiento'];
            $id_tipo_costo = (int)$_POST['id_tipo_costo'];
            $sql = "INSERT INTO categorias (nombre, id_tipo_movimiento, id_tipo_costo) VALUES ('$nombre', $id_tipo_movimiento, $id_tipo_costo)";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Categoría agregada con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'editCategoria':
            $id = (int)$_POST['id'];
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_tipo_movimiento = (int)$_POST['id_tipo_movimiento'];
            $id_tipo_costo = (int)$_POST['id_tipo_costo'];
            $sql = "UPDATE categorias SET nombre = '$nombre', id_tipo_movimiento = $id_tipo_movimiento, id_tipo_costo = $id_tipo_costo WHERE id = $id";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Categoría actualizada con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'deleteCategoria':
            $id = (int)$_POST['id'];
            $checkSql = "SELECT COUNT(*) as count FROM conceptos WHERE id_categoria = $id";
            $checkResult = $conn->query($checkSql)->fetch_assoc();
            if ($checkResult['count'] > 0) {
                $response = ['success' => false, 'message' => 'No se puede eliminar. Existen conceptos enlazados a esta categoría.'];
            } else {
                $sql = "DELETE FROM categorias WHERE id = $id";
                if ($conn->query($sql) === TRUE) {
                    $response = ['success' => true, 'message' => 'Categoría eliminada con éxito.'];
                } else {
                    $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
                }
            }
            break;

        // Lógica para Conceptos
        case 'addConcepto':
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_categoria = (int)$_POST['id_categoria'];
            $sql = "INSERT INTO conceptos (nombre, id_categoria) VALUES ('$nombre', $id_categoria)";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Concepto agregado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'editConcepto':
            $id = (int)$_POST['id'];
            $nombre = $conn->real_escape_string($_POST['nombre']);
            $id_categoria = (int)$_POST['id_categoria'];
            $sql = "UPDATE conceptos SET nombre = '$nombre', id_categoria = $id_categoria WHERE id = $id";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Concepto actualizado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;
        case 'deleteConcepto':
            $id = (int)$_POST['id'];
            $sql = "DELETE FROM conceptos WHERE id = $id";
            if ($conn->query($sql) === TRUE) {
                $response = ['success' => true, 'message' => 'Concepto eliminado con éxito.'];
            } else {
                $response = ['success' => false, 'message' => 'Error: ' . $conn->error];
            }
            break;

        default:
            $response = ['success' => false, 'message' => 'Acción no válida: ' . $action];
            break;
    }
}

$conn->close();
echo json_encode($response);
?>
