import socket
import threading
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

client_sockets = []



@socketio.on('domain_to_address')
def handle_domain_to_address(data):
    domainName=data['domainName']
    #도메인 네임 -> ip주소 -> binary변환
    ipAddress = socket.gethostbyname(domainName)
    binaryAddress= socket.inet_pton(socket.AF_INET, ipAddress)
    
    socketio.emit('domain_to_address',{'domainName':binaryAddress})

def handshake_request():
    return

def handshake_response():
    return

#tcp/ip소켓 생성 결과 확인
def make_connection(client_info):
    #이건 나중에 수정
        return

#byte little endian으로 변환 후 hex로 변환
def convert_msg_to_byte(msg):
    byteMsg = bytes(msg, 'utf-8')
    orderedByteMsg = bytearray(reversed( byteMsg))
    return {'byteMsg': byteMsg.hex(),'orderByteMsg':orderedByteMsg.hex()}


#클라이언트로 전송
@socketio.on('msg_to_byte')
def handle_msg_to_byte(msg):
    msg = convert_msg_to_byte(msg)
    socketio.emit('msg_to_byte', msg)

@socketio.on('recv_msg')
def handle_recv_msg(data):
    sender = data['sender']
    room_name = data['roomName']
    message = data['msg']
    #전송 데이터 예시: { 'sender': '홍길동', 'roomName': '홍철범', msg: '반갑수당' }
    socketio.emit('recv_msg', {'sender': sender, 'roomName': room_name, 'msg': message})

def client_thread(client_socket, addr):
    try:
        while True:
            data = client_socket.recv(65535)
            if not data: break
            print("메세지를 전송받았습니다 : ", addr)
            print("메세지 내용 : ", data.decode())

            client_socket.send(data)
        client_socket.close()
    except ConnectionResetError as e:
        print("Disconnected by User : ", addr)
    client_sockets.remove(client_socket)
    client_socket.close()



if __name__ == "__main__":
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((socket.gethostbyname(socket.gethostname()), 9000))
    server_socket.listen(1)
    print("서버가 시작되었습니다 : ", server_socket.getsockname())
    while True:
        client_socket, addr = server_socket.accept()
        if (len(client_sockets) >= 2):
            print("서버에 연결 가능한 Connection 수를 초과하였습니다")
            client_socket.close()
        else:
            thread = threading.Thread(target=client_thread, args=(client_socket, addr))
            print("연결됨 : ", addr)
            client_sockets.append(client_socket)
            print("현재 연결된 사용자 수 : ", len(client_sockets))
            thread.start()
    server_socket.close()
    socketio.run(app)
