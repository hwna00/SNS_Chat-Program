from client_tcp import Client_tcp
from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from socket import gethostbyname, inet_pton, AF_INET
from threading import *

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

chat_rooms = []


class Client_flask(Client_tcp):
    def connect(self):
        try:
            self.socket.connect((self.ip, self.port))
            print(f"{self.ip}:{self.port} : Connected to Server")
        except TimeoutError as e:
            emit("error", "TimeoutError")

    def recv(self):
        try:
            while not self.stop_flag:
                if self.socket.fileno() == -1:
                    print(f"{self.ip}:{self.port} : Disconnected by Server")
                    break
                data = self.socket.recv(65535)
                if not data:
                    print(f"{self.ip}:{self.port} : Disconnected from Server")
                    break
                if data.decode() == "SYN-ACK":
                    socketio.emit("handshake_request", {"msg": data.decode()})
                    self.socket.sendall(data)

                    socketio.emit("handshake_response", {"msg": data.decode()})
                elif data.decode() == "SERVER-CLOSE":
                    self.socket.close()
                else:
                    print(f"{self.ip}:{self.port} : {data.decode()}")
        except ConnectionAbortedError as e:
            print(f"{self.ip}:{self.port} : Disconnected from Server")
        except Exception as e2:
            print(f"{self.ip}:{self.port} : Error occured in recv - {e2}")
        finally:
            self.socket.close()
            return


@socketio.on("welcome")
def handle_welcome(roomName):
    join_room(roomName)
    for room in chat_rooms:
        if room["roomName"] == roomName:
            room["participants"] += 1
        print(room)
    emit("chat_rooms", chat_rooms, broadcast=True)
    emit("welcome", to=roomName)


@socketio.on("bye")
def handle_bye(roomName):
    print("bye")
    for room in chat_rooms:
        if room["roomName"] == roomName:
            room["participants"] -= 1

    emit("chat_rooms", chat_rooms, broadcast=True)
    emit("bye", to=roomName)


@socketio.on("create_connection")
def handle_create_connection(data):
    global client_socket

    domainName, port = data["domainName"].split(":")
    ip = gethostbyname(domainName)
    # nickname = data["nickname"]
    # ip_b = inet_pton(AF_INET, ip)

    client_socket = Client_flask(ip, int(port))
    # socketio.start_background_task(target=client_socket.recv)
    client_socket.start_client_tcp()

    emit("make_connection", {"result": True})


@socketio.on("domain_to_address")
def handle_domain_to_address(data):
    domain_list = data["domainName"].split(":")
    print(domain_list)

    ip = gethostbyname(domain_list[0])
    emit(
        "domain_to_address",
        {"ip": ip, "hex": str(inet_pton(AF_INET, ip))},
    )


# { "sender": "홍길동", "roomName": "홍철범", "msg": "반갑수당"}
@socketio.on("send_msg")
def handle_send_msg(data):
    global client_socket
    print(data)

    emit(
        "new_msg", {"targetRoom": data["roomName"], "msg": data["msg"]}, broadcast=True
    )
    client_socket.send(data)
    msg_b = bytes(data["msg"], "utf-8")

    emit(
        "msg_to_byte",
        {"byte": str(msg_b), "orderedByte": "orderedByte"},  # ! 메시지 변환 필요
    )
    emit(
        "recv_msg",
        {"sender": data["sender"], "msg": data["msg"], "targetRoom": data["roomName"]},
        to=data["roomName"],
    )


@socketio.on("chat_rooms")
def handle_chat_rooms():
    emit("chat_rooms", chat_rooms)


@socketio.on("create_chat_room")
def handle_create_chat_room(new_room_name):
    chat_rooms.append(
        {
            "roomName": new_room_name,
            "msgPreview": "",
            "participants": 0,
        }
    )
    emit("chat_rooms", chat_rooms, broadcast=True)


@socketio.on("destroy_connection")
def handle_destroy_connection():
    global client_socket
    client_socket.stop_client_tcp()


if __name__ == "__main__":
    socketio.run(app, port=8001, debug=True)
