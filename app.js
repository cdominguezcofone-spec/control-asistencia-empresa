// Tu URL de Google Apps Script Web App
const URL_API = "https://script.google.com/macros/s/AKfycby1bF4-ZTlt038QGLT6FI_ujJKaT9lybeV6zcsYGgWnUQu10Iqqe_PULJj6ekC3-UuzjA/exec";

function registrarFichaje(tipo) {
    const idEmpleado = document.getElementById("idEmpleado").value.trim();
    const mensajeEl = document.getElementById("mensaje");

    if (!idEmpleado) {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Por favor, ingresa tu ID de empleado.";
        return;
    }

    mensajeEl.style.color = "#333";
    mensajeEl.textContent = "Procesando fichaje...";

    // Estructura de datos a enviar
    const datos = {
        id_empleado: idEmpleado,
        tipo: tipo
    };

    // Petición a Google Sheets (usando no-cors para evitar problemas de bloqueo de navegador)
    fetch(URL_API, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
    .then(() => {
        mensajeEl.style.color = "green";
        mensajeEl.textContent = `¡${tipo} registrada con éxito para ${idEmpleado}!`;
        document.getElementById("idEmpleado").value = ""; // Limpiar input
    })
    .catch((error) => {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Error al conectar con el servidor.";
        console.error("Error:", error);
    });
}
