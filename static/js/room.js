// Ajustar el ancho máximo del área de entrada de mensajes al ancho actual
let width_input = $("#input-message").width()
$("#input-message").css('max-width',`${width_input}px`)

// Ajustar el ancho máximo del área de mensajes mostrados al ancho actual
let width_show = $("#p-show-message").width()
$("#p-show-message").css('max-width',`${width_show}px`)

// Ajustar la altura máxima del área de mensajes mostrados a la altura actual
let height_show = $("#p-show-message").height()
$("#p-show-message").css('max-height',`${height_show}px`)

// Manejar el evento de cambio de tamaño de la ventana
$(window).resize(function(){
    // Ajustar la altura máxima del área de mensajes mostrados al espacio disponible en la ventana
    let height_show = $("#container-chat").height() - 50
    $("#p-show-message").css('max-height',`${height_show}px`)
    
    // Ajustar el ancho máximo del área de mensajes mostrados al espacio disponible en la ventana
    let width_show = $(window).width() - $("#container-contacts").width() - 60
    $("#p-show-message").css('max-width',`${width_show}px`)
    
    // Ajustar el ancho máximo del área de entrada de mensajes al espacio disponible en la ventana
    let width_input = $(window).width() - $("#container-contacts").width() - 60
    $("#input-message").css('max-width',`${width_input}px`)
});

// Conectar al servidor de Socket.IO
let socketio = io(window.location.protocol + '//' + document.domain + ':' + location.port);

// Manejar el evento de conexión con el servidor
socketio.on('connect', function(){
    // Obtener el nombre de la sala desde la URL y unirse a esa sala
    let location = document.location.href.split('/');
    let name_room = location[location.length - 1]
    socketio.emit('join_in_room', {
        name_room: name_room
    }) 
})

// Obtener el nombre de la sala desde la URL
let name_room = window.location.pathname.split('/').pop();

// Mostrar el nombre de la sala en el título del chat
$("h1").text("¡Bienvenido a la Sala " + name_room + "!");


// Manejar el evento de recibir mensajes del servidor
let position = 0
socketio.on('message', function(data){
    if(data.action == 'join' || data.action == 'leave' || data.action == 'name'){
        // Mostrar mensajes de conexión, desconexión o cambio de nombre
        if($('#p-show-message').text().length != 0){
            $('#p-show-message').append('<br>'+data.message)
        }
        else{
            $('#p-show-message').html(data.message)
        }
    }
    else{
        // Mostrar mensajes de chat
        if($('#p-show-message').text().length != 0){
            $('#p-show-message').append('<br>'+data.user+" dice:"+"<br>"+data.message)
        }
    }
})

// Manejar el evento de pulsar la tecla Enter en el área de entrada de mensajes
$('#input-message').keyup(function(event){
    if(event.key == 'Enter'){
        // Enviar el mensaje al servidor cuando se pulsa Enter
        socketio.emit('message',{
            message:$('#input-message').text()
        });
        // Limpiar el área de entrada de mensajes después de enviar el mensaje
        $('#input-message').text("");
    }
})

// Manejar el evento de hacer clic en el botón para cambiar el nombre de usuario
$("#button-name-user").click(function(){
    let name_button = $("#button-name-user").text()
    if(name_button=='cambiar'){
        // Permitir la edición del nombre de usuario
        $("#name-user").attr('contenteditable','true');
        $("#button-name-user").text("guardar");
    }
    else if(name_button=='guardar'){
        // Guardar el nuevo nombre de usuario y enviarlo al servidor
        new_name = $("#name-user").text();
        socketio.emit('change_name',{
            name: new_name
        })
        // Desactivar la edición del nombre de usuario y cambiar el texto del botón
        $("#name-user").attr('contenteditable','false');
        $("#button-name-user").text("cambiar")
    }
});

// Manejar el evento de pulsar Enter en el área de edición del nombre de usuario
$("#name-user").keyup(function(event){
    if(event.key == "Enter"){
        // Guardar el nuevo nombre de usuario y enviarlo al servidor
        new_name = $("#name-user").text();
        socketio.emit('change_name',{
            name: new_name
        })
        // Desactivar la edición del nombre de usuario, cambiar el texto del botón y eliminar espacios en blanco
        $("#name-user").attr('contenteditable','false');
        $("#button-name-user").text("cambiar");
        $("#name-user").text($("#name-user").text().trim())
    }
})

// Manejar el evento de añadir un usuario a la lista de contactos
socketio.on('add_user',function(data){
    ids = data.id_users.split(' ')
    nicknames = data.nickname.split(' ')
    for(let i=0; i<ids.length; i++){
        contact = $(`#${ids[i]}`)
        if(contact.length <=0){
            // Añadir el usuario a la lista de contactos
            $('#container-contacts').html($('#container-contacts').html()+`<p id=${ids[i]}>${nicknames[i]}</p>`)
        }
    }
})

// Manejar el evento de eliminar un usuario al desconectarse
socketio.on('delete_name',function(data){
    id_user = data.id_user
    $(`#${id_user}`).remove()
})

// Manejar el evento de cambiar el nombre de un usuario
socketio.on('change_name',function(data){
    id_user = data.id_user
    nickname = data.nickname
    $(`#${id_user}`).text(nickname)
})