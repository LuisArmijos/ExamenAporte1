// Función para crear una sala mediante una solicitud AJAX
function createRoom() {
    // Realizar una solicitud AJAX al servidor para crear una sala
    $.ajax({
        url: '/link_create_room',
        method: 'post',
        data: {
            name_room: $("#input-create").text().trim()
        }
    }).done(function (data) {
        // Manejar la respuesta del servidor
        if (data.state === 'error') {
            // Mostrar un mensaje de error si la creación de la sala falla
            showMessage(data.result, 'error');
        } else if (data.state === 'ok') {
            // Mostrar un mensaje de éxito y redirigir a la nueva sala creada
            let link = window.location + data.result;
            showMessage("Puedes unirte a la sesión con: " + link, 'success');
            location.href = link;
        }
    });
}

// Función para mostrar un mensaje en una ventana de alerta
function showMessage(message, type) {
    alert(message);
}

// Manejar el clic en el botón de crear sala
$(".button-create").click(function () {
    createRoom();
});

// Manejar la pulsación de la tecla Enter en el área de creación de sala
$("#input-create").keypress(function (event) {
    if (event.key === 'Enter') {
        if ($("#input-create").text().trim() === "") {
            $("#input-create").text("");
        } else {
            // Llamar a la función createRoom() al presionar Enter
            createRoom();
            $("#input-create").text("");
        }
    }
});

// Manejar el clic en el botón de unirse a sala
$(".button-join").click(function () {
    // Obtener el enlace de la sala desde el campo de entrada y redirigir a la sala
    let link = $("#input-join").text().trim();
    location.href = link;
});

// Manejar la pulsación de la tecla Enter en el campo de entrada para unirse a sala
$("#input-join").keypress(function (event) {
    if (event.key === 'Enter') {
        // Obtener el enlace de la sala desde el campo de entrada y redirigir a la sala
        let link = $("#input-join").text().trim();
        location.href = link;
    }
});