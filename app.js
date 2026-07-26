const URL_API = "https://script.google.com/macros/s/AKfycbxfLLc5emyPMR0G6ZWFps5GCm2U6P6bzHx1dspSSTMN_HvE8G1fMJ1LiYE_U5AT4_V-4w/exec";
let html5QrCode = null;
let idActual = "";

// Función que captura el botón "Guardar ID" del HTML
function guardarUsuarioManual() {
    const idInput = document.getElementById("idEmpleado");
    const id = idInput.value.trim();
    
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
    
    // Cambia de pantalla correctamente al panel de entrada y salida
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
            errorMessage => {}
        ).catch(err => {
            alert("No se pudo acceder a la cámara o permisos denegados.");
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

    const accionTipo = (tipo.toLowerCase() === "entrada") ? "fichaje_entrada" : "fichaje_salida";

    let iframe = document.getElementById("hidden-iframe");
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "hidden-iframe";
        iframe.id = "hidden-iframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "GET";
    form.action = URL_API;
    form.target = "hidden-iframe";

    const inputAccion = document.createElement("input");
    inputAccion.type = "hidden";
    inputAccion.name = "accion";
    inputAccion.value = accionTipo;
    form.appendChild(inputAccion);

    const inputId = document.createElement("input");
    inputId.type = "hidden";
    inputId.name = "id_empleado";
    inputId.value = idActual;
    form.appendChild(inputId);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setTimeout(() => {
        mensajeEl.style.color = "green";
        mensajeEl.textContent = `¡${tipo} registrada con éxito para ${idActual}!`;
        
        setTimeout(() => {
            cambiarUsuario();
        }, 3000);
    }, 1000);
}
