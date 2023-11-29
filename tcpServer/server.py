from socket import *
from threading import *
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

clients = []
stop_server_flag = False

# TODO: 서버에 메시지가 올 때마다 new_msg 이벤트를 emit 해야 한다.
# TODO: 아래 로직 중, 메시지 수신부에 emit('new_msg', {데이터}) 형식으로 전송한다.

# TODO: 문제가 발생한 경우에는, emit('error', '에러 메시지') 형식으로 전송한다.


def make_listening_socket(IP, HOST) -> socket:
    server_socket = socket(AF_INET, SOCK_STREAM)  # TCP/IP Protocol
    server_socket.bind((IP, HOST))
    server_socket.settimeout(2000)
    return server_socket


def handshaking(server_socket, client_socket, addr) -> bool:
    print(
        f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Accept SYN from client({addr[0]}:{addr[1]})"
    )
    socketio.emit("1st_handshake_response", {"handshake_response": b"SYN"})
    client_socket.sendall(b"SYN-ACK")
    socketio.emit("handshake_request", {"handshake_request": b"SYN-ACK"})
    print(
        f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Send SYN-ACK to client({addr[0]}:{addr[1]})"
    )
    data = client_socket.recv(1024)
    print(f"{addr[0]}:{addr[1]} : Received SYN-ACK data({data.decode()})")
    socketio.emit("2nd_handshake_response", {"handshake_response": data.decode()})
    if data.decode() == "SYN-ACK":
        return True
    return False


def client_thread(client_socket, addr):
    global clients
    try:
        while True:
            data = client_socket.recv(65535)
            if not data:
                break
            print(f"{addr[0]}:{addr[1]} : {data.decode()}")
            for client in clients:
                client.sendall(data)
    except ConnectionResetError as e:
        print(f"{addr[0]}:{addr[1]} : Disconnected by User")

    if client_socket in clients:
        clients.remove(client_socket)
    client_socket.close()


def start_server(server_socket: socket, max_connection: int) -> int:
    global clients
    global stop_server_flag
    server_socket.listen()
    print(
        f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Server Started ..."
    )
    while not stop_server_flag:  # Input flag here
        client_socket, addr = server_socket.accept()
        if len(clients) >= max_connection:
            print(f"{addr[0]}:{addr[1]} : Accept Denied - Max Connection Error")
            socketio.emit("error", {"message": "Accept Denied - Max Connection Error"})
            socketio.emit("make_connection", {"result": False})
            client_socket.close()
            continue
        if handshaking(server_socket, client_socket, addr) is False:
            print(f"{addr[0]}:{addr[1]} : Accept Denied - 3-way-handshaking Error")
            socketio.emit(
                "error", {"message": "Accept Denied - 3-way-handshaking Error"}
            )
            socketio.emit("make_connection", {"result": False})
            client_socket.close()
            continue
        client = Thread(target=client_thread, args=(client_socket, addr))
        clients.append(client_socket)
        print(f"{addr[0]}:{addr[1]} : Connected Successfully")
        socketio.emit("make_connection", {"result": True})
        print(
            f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : {len(clients)} connected to server"
        )
        client.start()
    server_socket.close()


@app.route("/")
def hello():
    return "hello"


@socketio.on("domain_to_address")
def handle_domain_to_address(data):
    # TODO: 주소 변환 로직 추가하기
    # emit("domain_to_address", {데이터})
    pass


@socketio.on("create_server")
def handle_create_server(data):
    global stop_server_flag
    # 전송 데이터 예시: { "domainName": "localhost:3000", "maxConn": 8 }
    domainName = data["domainName"]
    print(domainName)
    maxConn = data["maxConn"]
    print(maxConn)
    domainList = domainName.split(":")
    ip_address = gethostbyname(domainList[0])
    print(ip_address)
    port = int(domainList[1])
    print(port)
    server_socket = make_listening_socket(ip_address, port)
    stop_server_flag = False
    server = Thread(target=start_server, args=(server_socket, maxConn))
    server.start()
    emit("create_server")
    while True:
        # s = input("Input : ")
        s = "hello"
        if s == "end":
            stop_server_flag = True
            server.join()
            break


# TODO: 다음 하드코딩된 값을 변경하기
@socketio.on("client_connected")
def handle_client_connected():
    emit("conn_info", {"maxConn": "8", "currConn": "3"})
    emit(
        "clients",
        [
            {
                "nickname": "홍세원",
                "socketAddr": "localhost:54732",
            },
            {
                "nickname": "조항범",
                "socketAddr": "localhost:48823",
            },
        ],
    )
    pass


@socketio.on("trash")
def handle_trash(data):
    trash = data["can"]
    print(f"Received trash: {trash}")


if __name__ == "__main__":
    socketio.run(app, port=8000, debug=True)
