const URL_API = "https://script.google.com/macros/s/AKfycby1bF4-ZTlt038QGLT6FI_ujJKaT9lybeV6zcsYGgWnUQu10Iqqe_PULJj6ekC3-UuzjA/exec";

// Al cargar la página, verificamos si ya guardó su usuario antes
window.onload = function() {
    const usuarioGuardado = localStorage.getItem("id_empleado_guardado");
    if (usuarioGuardado) {
        document.getElementById("idEmpleado").value = usuarioGuardado;
        document.getElementById("input-container").style.display = "none";
        document.getElementById("lbl-usuario").textContent = usuarioGuardado;
        document.getElementById("usuario-guardado").style.display = "block";
    }
};

function guardarUsuario() {
    const id = document.getElementById("idEmpleado").value.trim();
    if (!id) {
        alert("Ingresá un ID válido.");
        return;
    }
    localStorage.setItem("id_empleado_guardado", id);
    location.reload();
}

function cambiarUsuario() {
    localStorage.removeItem("id_empleado_guardado");
    location.reload();
}

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
    });
}

// --- LECTOR DE CÓDIGO QR ---
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
                registrarFichaje("Entrada", qrCodeMessage);
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
