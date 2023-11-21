from os import name 

# Clase que representa una sala
class Room:

    rooms = list()  # Lista de salas

    def __init__(self, name_room):
        self.__name_room = name_room
        self.__users = list()

    def __eq__(self, name_room):
        return self.__name_room == name_room

    @property
    def name_room(self):
        return self.__name_room

    @property
    def users(self):
        return self.__users
    
    @classmethod
    def get_room(cls, name_room):
        try:
            index = cls.rooms.index(name_room)
            room = cls.rooms[index]
        except ValueError:
            room = None
        return room

    @classmethod
    def eliminate_room(cls, name_room):
        try:
            cls.rooms.remove(name_room)
        except ValueError:
            pass

    def delete_user(self, id_user):
        try:
            self.__users.remove(id_user)
        except ValueError:
            pass

# Clase que representa un usuario
class User:

    users = list()  # Lista de usuarios

    def __init__(self, nickname, id_user, room):
        self.__nickname = nickname
        self.__id_user = id_user
        self.__room = room

    def __eq__(self, id_user):
        return self.__id_user == id_user

    @property
    def nickname(self):
        return self.__nickname

    @nickname.setter
    def nickname(self, nickname):
        self.__nickname = nickname

    @property
    def id_user(self):
        return self.__id_user

    @property
    def room(self):
        return self.__room

    @classmethod
    def get_user(cls, id_user):
        try:
            index = cls.users.index(id_user)
            user = cls.users[index]
        except ValueError:
            user = None
        return user
    
    @classmethod
    def eliminate_user(cls, id_user):
        try:
            cls.users.remove(id_user)
        except ValueError:
            pass
