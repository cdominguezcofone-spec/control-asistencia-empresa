const URL_API = "https://script.google.com/macros/s/AKfycbzPUk0uKHcQLChcyzjn8Dnjr1dEpkYF5PAGcWgzqFnTT18UqOPBRa51u_5wxxQT5wGRJg/exec";

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idUrl = urlParams.get("id");
    
    if (idUrl) {
        localStorage.setItem("id_empleado_guardado", idUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const usuarioGuardado = localStorage.getItem("id_empleado_guardado");

    if (usuarioGuardado) {
        document.getElementById("idEmpleado").value = usuarioGuardado;
        document.getElementById("input-container").style.display = "none";
        document.getElementById("lbl-usuario").textContent = usuarioGuardado;
        document.getElementById("panel-fichaje").style.display = "block";
    }
};

function guardarUsuarioManual() {
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

function registrarFichaje(tipo) {
    const idEmpleado = localStorage.getItem("id_empleado_guardado");
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
    .catch(error => {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Error al conectar con el servidor.";
    });
}

let html5QrCode;

function toggleScanner() {
    const readerDiv = document.getElementById("reader");
    if (readerDiv.style.display === "none" || readerDiv.style.display === "") {
        readerDiv.style.display = "block";
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: 250 }, 
            qrCodeMessage => {
                if (qrCodeMessage.includes("?id=")) {
                    const urlEscaneada = new URL(qrCodeMessage);
                    idDetectado = urlEscaneada.searchParams.get("id");
                } else {
                    idDetectado = qrCodeMessage;
                }
                
                localStorage.setItem("id_empleado_guardado", idDetectado);
                if(html5QrCode) {
                    html5QrCode.stop();
                }
                readerDiv.style.display = "none";
                location.reload();
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
