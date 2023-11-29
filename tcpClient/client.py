import struct
from socket import *
from threading import Lock, Thread
from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# 전역 변수로 소켓을 저장할 리스트 생성
client_sockets = []
lock = Lock()


def connect(addr):
    client_socket = socket(AF_INET, SOCK_STREAM)
    try:
        client_socket.connect((addr[0], addr[1]))
        print(f"{addr[0]}:{addr[1]} : Connected")
    except TimeoutError as e:
        print(f"{addr[0]}:{addr[1]} : Connection Failed - Timeout Error")
    finally:
        return client_socket


def recv(client_socket, addr):
    try:
        while True:
            # Check if the socket is still connected
            if client_socket.fileno() == -1:
                print(f"{addr[0]}:{addr[1]} : Socket disconnected")
                break

            data = client_socket.recv(65535)
            if not data:
                # No data received, which may indicate a closed connection
                print(f"{addr[0]}:{addr[1]} : Connection closed by the server")
                break

            if data.decode() == "SYN-ACK":
                client_socket.sendall(b"SYN-ACK")
            else:
                print(f"{addr[0]}:{addr[1]} : {data.decode()}")
                msg = data.decode()
    except ConnectionAbortedError as e:
        print(f"{addr[0]}:{addr[1]} : Disconnected from server")
    except Exception as e:
        print(f"{addr[0]}:{addr[1]} : Error in recv - {e}")
    finally:
        # Close the socket to ensure proper cleanup
        client_socket.close()
    return


def send(client_socket, addr, data):
    try:
        client_socket.sendall(data.decode())
        print(f"{addr[0]}:{addr[1]} : Send successful")
    except Exception as e:
        print(f"{addr[0]}:{addr[1]} : Send Failed - {e}")
    return


@socketio.on("domain_to_address")
def handle_domain_to_address(data):
    # 전송 데이터 예시: { 'domainName': 'localhost:3000'}
    print("domain to address")
    domainName_port = data["domainName"]
    domainlist = domainName_port.split(":")
    domainName = domainlist[0]
    # 포트번호 정수 변환
    port = int(domainlist[1])
    ip_address = gethostbyname(domainName)
    print(ip_address, port)
    binary_ip = inet_pton(AF_INET, ip_address)
    emit("domain_to_address", {"ip": ip_address, "hex": str(binary_ip)})


@socketio.on("create_connection")
def handle_create_connection(data):
    # 전송 데이터 예시: { "nickname": "홍길동", "domainName": "localhost:3000" }

    nickname = data["nickname"]
    domainName_port = data["domainName"]
    domainName, port = domainName_port.split(":")
    print(domainName, port)

    # 포트번호 정수 변환
    port = int(port)
    ip_address = gethostbyname(domainName)
    binary_ip = inet_pton(AF_INET, ip_address)

    # 이거 ip받는 거 binary로 받는지 아니면 그냥 받는지 물어보기
    addr = (ip_address, port)
    client_socket = connect(addr)

    # Lock을 사용하여 소켓 동기화
    with lock:
        client_sockets.append(client_socket)
    client = Thread(target=recv, args=(client_socket, addr))
    client.start()

    # TODO: 연결이 실패한 경우, error 이벤트만 emit 하기

    # TODO: handshake_request, handshake_response 이벤트 emit
    # TODO: 위치는 변경 가능함
    emit("handshake_request", {"msg": "요청 메시지"})
    emit("handshake_response", {"msg": "응답 메시지"})

    # TODO: make_connection 이벤트 emit
    emit("make_connection", {"result": True})


@socketio.on("send_msg")
def handle_send_msg(data):
    # 전송 데이터 예시: { "sender": "홍길동", "roomName": "홍철범", "msg": "반갑수당"}
    sender = data["sender"]
    roomName = data["roomName"]

    print(sender, roomName)
    msg = data["msg"]

    emit("new_msg", {"targetRoom": roomName, "msg": msg}, broadcast=True)

    join_room(sender)
    # sender,msg byte변환
    byte_sender = bytes(sender, "utf-8")
    byte_msg = bytes(msg, "utf-8")

    # little endian으로 byteorder
    # 이건 나중에 추가로 수정하기
    little_endian_msg = struct.pack("<{}s".format(len(byte_msg)), byte_msg)  # 추가 수정,,,
    print(msg)

    # TODO: 하드코딩된 값을 실제 변환 값으로 변경하기
    emit(
        "msg_to_byte", {"byte": str(byte_msg), "orderedByte": "orderedByte"}, to=sender
    )
    emit(
        "recv_msg", {"sender": sender, "msg": msg, "targetRoom": roomName}, to=roomName
    )

    # ?: 아래 로직은 무엇을 위해 존재하는 것인지..?
    while True:
        if msg == "quit":
            client_socket.close()
            # Lock을 사용하여 소켓 동기화
            with lock:
                client_sockets.remove(client_socket)
            break
        # Lock을 사용하여 소켓 동기화
        with lock:
            for client_socket in client_sockets:
                send(client_socket, (None, None), byte_msg)


# TODO: chat_rooms 이벤트 처리하기
@socketio.on("chat_rooms")
def handle_chat_rooms():
    emit(
        "chat_rooms",
        [
            {
                "roomName": "홍철범",
                "msgPreview": "나 하닌데..",
                "participants": 3,
            },
            {
                "roomName": "왕밤빵",
                "msgPreview": "나 민진데..",
                "participants": 4,
            },
        ],
    )


# TODO: welcome 이벤트 처리하기
@socketio.on("welcome")
def handle_welcome(roomName):
    join_room(roomName)
    emit("welcome", to=roomName)


# TODO: destroy_connection 이벤트 처리하기
@socketio.on("destroy_connection")
def handle_destroy_connection():
    pass


if __name__ == "__main__":
    socketio.run(app, port=8001, debug=True)
