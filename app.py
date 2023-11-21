from os import name
from flask import Flask, json, render_template, redirect, request, jsonify, url_for  # Importa clases y funciones de Flask
from flask_socketio import SocketIO, rooms, leave_room, join_room  # Importa clases y funciones de Flask-SocketIO
from model import Room, User  # Importa las clases Room y User desde el archivo model.py

app = Flask(__name__)  # Crea una instancia de la aplicación Flask
app.config['SECRET_KEY'] = 'secret!'  # Configura la clave secreta para la aplicación Flask

socket = SocketIO(app)  # Crea una instancia de SocketIO y la asocia a la aplicación Flask

# Ruta principal
@app.route('/')
def index():
    return render_template('index.html')  # Renderiza el template 'index.html'

# Ruta para manejar la creación de salas
@app.route('/link_create_room', methods=['post'])
def link_create_room():
    name_room = request.form['name_room'].strip()  # Obtiene el nombre de la sala desde el formulario
    if name_room == "":
        result = jsonify(state='error', result='campo vacío')  # Devuelve un mensaje de error si el campo está vacío
    else:
        if name_room in Room.rooms:
            result = jsonify(state='error', result='Ese nombre ya está siendo usado')  # Devuelve un mensaje de error si el nombre ya está en uso
        else:
            result = jsonify(state='ok', result=name_room)  # Devuelve un mensaje de éxito si la sala se crea correctamente
            room = Room(name_room)  # Crea una nueva instancia de la clase Room
            Room.rooms.append(room)  # Agrega la sala a la lista de salas
    return result

# Ruta para unirse a una sala existente
@app.route('/<name_room>')
def link_join_room(name_room):
    print(Room.rooms)
    if name_room in Room.rooms:
        print("¿Hay alguien conectado?")
        result = render_template('room.html')  # Renderiza el template 'room.html'
    else:
        print("No hay nadie.")
        return redirect(url_for('index'))  # Redirige a la ruta principal si la sala no existe
    return result

# Evento de SocketIO para unirse a una sala
@socket.on('join_in_room')
def join_in_room(data):
    name_room = data['name_room']
    join_room(name_room)
    room = Room.get_room(name_room)
    if room is not None:
        user = User('User', request.sid, room)  # Crea un nuevo usuario
        room.users.append(user)  # Añade el usuario a la sala
        User.users.append(user)  # Añade el usuario a la lista de usuarios
        print(User.users)
        socket.emit('message', {
            'action': 'join',
            'message': f'{user.nickname} se acaba de unir'
        }, room=name_room)
        socket.emit('add_user', {
            "id_users": (' ').join([i.id_user for i in room.users]),
            "nickname": (' ').join([i.nickname for i in room.users])
        },
        room=name_room)

# Evento de SocketIO para enviar mensajes
@socket.on('message')
def message(data):
    user = User.get_user(request.sid)
    room = user.room
    socket.emit('message', {
        'action': 'message',
        'user': user.nickname,
        'message': data["message"]
    }, room=room.name_room)

# Evento de SocketIO para cambiar nombres de usuario
@socket.on('change_name')
def change_name(data):
    new_name = data['name']
    user = User.get_user(request.sid)
    if user is not None:
        name = user.nickname
        user.nickname = new_name
        socket.emit('change_name', {
            'id_user': request.sid,
            'nickname': new_name
        },
                    room=user.room.name_room)

        socket.emit('message', {
            'action': 'name',
            'message': f"{name} ha cambiado a {new_name}"
        }, room=user.room.name_room)

# Evento de SocketIO para manejar desconexiones
@socket.on('disconnect')
def disconnect():
    user = User.get_user(request.sid)
    if user is not None:
        room = user.room
        leave_room(room.name_room)
        socket.emit('message', {
            'action': 'leave',
            'message': f'{user.nickname} se ha ido'
        }, room=room.name_room)
        socket.emit('delete_name', {
            'id_user': request.sid
        }, room=room.name_room)
        User.eliminate_user(request.sid)  # Elimina al usuario de la lista de usuarios
        room.delete_user(request.sid)
        if len(room.users) == 0:
            Room.eliminate_room(room.name_room)  # Elimina la sala si ya no queda nadie

# Ejecutar la aplicación Flask con SocketIO
if __name__ == '__main__':
    socket.run(app, debug=True, host='0.0.0.0')