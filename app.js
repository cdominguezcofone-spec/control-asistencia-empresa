// Tu URL de Google Apps Script Web App
const URL_API = "https://script.google.com/macros/s/AKfycby1bF4-ZTlt038QGLT6FI_ujJKaT9lybeV6zcsYGgWnUQu10Iqqe_PULJj6ekC3-UuzjA/exec";

// Al cargar la página, gestionamos el QR y la memoria del usuario
window.onload = function() {
    // 1. Revisar si la URL trae un ID integrado (ej: ?id=JP-8421 al escanear el QR)
    const urlParams = new URLSearchParams(window.location.search);
    const idUrl = urlParams.get("id");

    if (idUrl) {
        // Si viene del QR, lo guardamos automáticamente en la memoria del navegador
        localStorage.setItem("id_empleado_guardado", idUrl);
        // Limpiamos la URL para que quede prolija en el navegador del celular
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Verificamos si ya hay un usuario guardado previamente
    const usuarioGuardado = localStorage.getItem("id_empleado_guardado");
    if (usuarioGuardado) {
        document.getElementById("idEmpleado").value = usuarioGuardado;
        document.getElementById("input-container").style.display = "none";
        document.getElementById("lbl-usuario").textContent = usuarioGuardado;
        document.getElementById("usuario-guardado").style.display = "block";
    }
};

// Guardar usuario manualmente si ingresa el ID tipeando
function guardarUsuario() {
    const id = document.getElementById("idEmpleado").value.trim();
    if (!id) {
        alert("Ingresá un ID válido.");
        return;
    }
    localStorage.setItem("id_empleado_guardado", id);
    location.reload();
}

// Botón para cambiar de usuario (borra la memoria)
function cambiarUsuario() {
    localStorage.removeItem("id_empleado_guardado");
    location.reload();
}

// Función principal para registrar Entrada o Salida
function registrarFichaje(tipo, idForzado = null) {
    const idEmpleado = idForzado || localStorage.getItem("id_empleado_guardado") || document.getElementById("idEmpleado").value.trim();
    const mensajeEl = document.getElementById("mensaje");

    if (!idEmpleado) {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Por favor, ingresa o escanea tu ID.";
        return;
    }

    mensajeEl.style.color = "#333";
    mensajeEl.textContent = "Procesando fichaje...";

    const datos = {
        id_empleado: idEmpleado,
        tipo: tipo
    };

    // Envío de datos a Google Apps Script
    fetch(URL_API, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(() => {
        mensajeEl.style.color = "green";
        mensajeEl.textContent = `¡${tipo} registrada con éxito (${idEmpleado})!`;
    })
    .catch((error) => {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Error al conectar con el servidor.";
        console.error("Error:", error);
    });
}

// --- LECTOR DE CÓDIGO QR INTERNO (Por si usan la cámara de la app) ---
let html5QrCode;
function toggleScanner() {
    const readerDiv = document.getElementById("reader");
    if (readerDiv.style.display === "none") {
        readerDiv.style.display = "block";
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: 250 },
            qrCodeMessage => {
                html5QrCode.stop();
                readerDiv.style.display = "none";
                
                // Si escanean el QR que contiene la URL completa, extraemos el ID o usamos el texto
                let idDetectado = qrCodeMessage;
                if (qrCodeMessage.includes("?id=")) {
                    const urlEscaneada = new URL(qrCodeMessage);
                    idDetectado = urlEscaneada.searchParams.get("id");
                }

                registrarFichaje("Entrada", idDetectado);
            },
            errorMessage => {}
        ).catch(err => {
            alert("No se pudo acceder a la cámara.");
        });
    } else {
        if (html5QrCode) {
            html5QrCode.stop();
        }
        readerDiv.style.display = "none";
    }
}
