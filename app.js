const URL_API = "https://script.google.com/macros/s/AKfycbxfLLc5emyPMR0G6ZWFps5GCm2U6P6bzHx1dspSSTMN_HvE8G1fMJ1LiYE_U5AT4_V-4w/exec";
let html5QrCode = null;
let idActual = "";

function guardarUsuarioManual() {
    const id = document.getElementById("idEmpleado").value.trim();
    if (!id) {
        alert("Por favor ingresa un ID válido.");
        return;
    }
    procesarIdentificacion(id);
}

function procesarIdentificacion(id) {
    idActual = id;
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.log(err));
    }
    document.getElementById("input-container").classList.add("oculto");
    document.getElementById("panel-fichaje").classList.remove("oculto");
    document.getElementById("lbl-usuario").textContent = idActual;
    document.getElementById("mensaje").textContent = "";
}

function cambiarUsuario() {
    idActual = "";
    document.getElementById("idEmpleado").value = "";
    document.getElementById("panel-fichaje").classList.add("oculto");
    document.getElementById("input-container").classList.remove("oculto");
    document.getElementById("mensaje").textContent = "";
}

function toggleScanner() {
    const readerDiv = document.getElementById("reader");
    if (readerDiv.classList.contains("oculto")) {
        readerDiv.classList.remove("oculto");
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            qrCodeMessage => {
                let matchId = qrCodeMessage;
                if (qrCodeMessage.includes("?id=")) {
                    matchId = qrCodeMessage.split("?id=")[1];
                }
                procesarIdentificacion(matchId);
            },
            errorMessage => {
                // Errores de escaneo en tiempo real se pueden ignorar
            }
        ).catch(err => {
            alert("No se pudo acceder a la cámara.");
            readerDiv.classList.add("oculto");
        });
    } else {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                readerDiv.classList.add("oculto");
            }).catch(err => console.log(err));
        } else {
            readerDiv.classList.add("oculto");
        }
    }
}

function registrarFichaje(tipo) {
    const mensajeEl = document.getElementById("mensaje");
    mensajeEl.style.color = "#333";
    mensajeEl.textContent = "Registrando " + tipo + "...";

    const urlFinal = `${URL_API}?accion=fichaje_${tipo.toLowerCase()}&id_empleado=${encodeURIComponent(idActual)}`;

    fetch(urlFinal, {
        method: "GET",
        mode: "no-cors"
    })
    .then(() => {
        mensajeEl.style.color = "green";
        mensajeEl.textContent = `¡${tipo} registrada con éxito para ${idActual}!`;
    })
    .catch(error => {
        mensajeEl.style.color = "red";
        mensajeEl.textContent = "Error al conectar con la planilla.";
        console.error("Error:", error);
    });
}
