from server_tcp import Server_tcp
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from threading import *
from socket import gethostbyname, inet_pton, AF_INET


app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Byte Ordering(Little Endian)
def littleEndian(b):
    result = ''.join(list(bytes(b, "utf-8"))[::-1])


class Server_flask(Server_tcp):
    # ! 아래 형식은 넘어오는 data의 형식이 아닌, 보내야 하는 데이터의 형식
    # { "sender": "하철환", "msg": "반갑수당", "byte": "byte", "orderedByte": "orderedByte", "target": "홍철범"}
    def client_thread(self, client_socket, client_addr):
        try:
            socketio.emit(
                "conn_info",
                {
                    "maxConn": str(self.max_connection),
                    "currConn": str(len(self.client_list)),
                },
            )

            list = []
            for client in self.client_list:
                client_ip = str(client.getpeername()[0])
                client_port = str(client.getpeername()[1])
                list.append(f"{client_ip}:{client_port}")
            socketio.emit("clients", list)
            while True:
                data = client_socket.recv(65535)
                if not data:
                    break
                data = eval(data.decode())
                print(data)
                # Message Received from Client

                # ! byte, orderedByte는 data에 담겨오지 않음.
                # ! 따라서 직접 변환해야 함.

                socketio.emit(
                    "new_msg",
                    {
                        "sender": data["sender"],
                        "msg": data["msg"],
                        "clientSockAddr": data["clientSockAddr"],
                        "byte": littleEndian(data["msg"]),
                        "orderedByte": "littleEndian",
                        "target": data["roomName"],
                    },
                )
        except ConnectionResetError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
            emit("error", "ConnectionResetError")
        except ConnectionAbortedError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
            emit("error", "ConnectionAbortedError")
        finally:
            socketio.emit(
                "conn_info",
                {
                    "maxConn": str(self.max_connection),
                    "currConn": str(len(self.client_list)),
                },
            )
            list = []
            for client in self.client_list:
                client_ip = str(client.getpeername()[0])
                client_port = str(client.getpeername()[1])
                list.append(f"{client_ip}:{client_port}")
            socketio.emit("clients", list)

        if client_socket in self.client_list:
            self.client_list.remove(client_socket)

        print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
        client_socket.close()


@app.route("/")
def handle_root():
    return "Hello"


@socketio.on("create_server")
# { "domainName": "localhost:3000", "maxConn": 8 }
def handle_create_server(data):
    global server_socket

    max_connection = int(data["maxConn"])
    domain_list = data["domainName"].split(":")

    ip = gethostbyname(domain_list[0])
    port = int(domain_list[1])

    server_socket = Server_flask(ip, port, max_connection)
    server_socket.start_tcp_server()

    emit("create_server")


@socketio.on("domain_to_address")
def handle_domain_to_address(data):
    domain_list = data["domainName"].split(":")
    print(domain_list)

    ip = gethostbyname(domain_list[0])
    emit(
        "domain_to_address",
        {
            "ip": ip,
            "hex": str(inet_pton(AF_INET, ip)),
        },
    )


@socketio.on("client_connected")
def handle_client_connected():
    global server_socket

    print(
        f"maxConn : {str(server_socket.max_connection)}, currConn : {str(len(server_socket.client_list))}"
    )  # For debug
    emit(
        "conn_info",
        {
            "maxConn": str(server_socket.max_connection),
            "currConn": str(len(server_socket.client_list)),
        },
    )
    list = []
    for client in server_socket.client_list:
        client_ip = str(client.getpeername()[0])
        client_port = str(client.getpeername()[1])
        list.append(f"{client_ip}:{client_port}")
        socketio.emit("clients", list)
    emit("clients", list)


if __name__ == "__main__":
    socketio.run(app, port=8000, debug=True)
