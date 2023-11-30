from server_tcp import Server_tcp
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from threading import *
from socket import gethostbyname

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

class Server_flask(Server_tcp):
    # { "sender": "하철환", "msg": "반갑수당", "byte": "byte", "orderedByte": "orderedByte", "target": "홍철범"}
    def client_thread(self, client_socket, client_addr):
        try:
            while True:
                data = client_socket.recv(65535)
                if not data: break
                data = eval(data.decode())
                # Message Received from Client
                print(f"sender:{data["sender"]}, msg:{data["msg"]}, byte:{data["byte"]}, orderByte:{data["orderedByte"]}, target:{data["target"]}") # For debug
                emit("new_msg", {"sender": data["sender"], "msg": data["msg"], "byte": data["byte"], "orderedByte": data["orderedByte"], "target": data["target"]})
        except ConnectionResetError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
            emit("error", "ConnectionResetError")
        except ConnectionAbortedError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
            emit("error", "ConnectionAbortedError")
        if client_socket in self.client_list:
            self.client_list.remove(client_socket)
        print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
        client_socket.close()

@app.route('/')
def handle_root():
    return "Hello"

@socketio.on('create_server')
# { "domainName": "localhost:3000", "maxConn": 8 }
def handle_create_server(data):
    global server_socket
    data = eval(data)
    max_connection = int(data["maxConn"])
    domain_list = data["domainName"].split(":")
    ip = gethostbyname(domain_list[0])
    port = int(domain_list[1])
    server_socket = Server_flask(ip, port, max_connection)
    server_socket.start_tcp_server()
    emit("create_server")

@socketio.on('domain_to_address')
# { "domainName": "localhost:3000" }
def handle_domain_to_address(data):
    global server_socket
    data = eval(data)
    domain_list = data["domainName"].split(":")
    print(gethostbyname(domain_list[0])) # For debug
    emit("domain_to_address", {gethostbyname(domain_list[0])})

@socketio.on('client_connected')
def handle_client_connected(data):
    global server_socket
    data = eval(data)
    print(f"maxConn : {str(server_socket.max_connection)}, currConn : {str(len(server_socket.client_list))}") # For debug
    emit("conn_info", {"maxConn": str(server_socket.max_connection), "currConn": str(len(server_socket.client_list))})

if __name__ == "__main__":
    socketio.run(app, port=8000, debug=True)