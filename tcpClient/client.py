from flask import Flask
from flask_socketio import SocketIO

clientSocket = Flask(__name__)        #플라스크 객체 생성
socketio = SocketIO(clientSocket, cors_allowed_origins="*")

@socketio.on('domain_to_address')
def handle_domain_to_address(data):
    #전송 데이터 예시: { 'domainName': 'localhost:3000' }
    domainName = data['domainName']    

@socketio.on('create_connection')
def handle_create_connection(data):
    #전송 데이터 예시: { 'nickname': '홍길동', 'domainName': 'localhost:3000' }
    nickname = data['nickname']
    domainName = data['domainName']
    #tcp/ip클라이언트 소켓 생성


@socketio.on('send_msg')
def handle_send_msg(data):
    #전송 데이터 예시: { 'sender': '홍길동', 'roomName': '홍철범', msg: '반갑수당' }
    sender = data['sender']
    roomName = data['roomName']
    msg = data['msg']

    #byte 변환
    roomNameByte = roomName.encode('utf-8')
    msgByte = msg.encode('utf-8')

    socketio.emit('msg_to_byte',{'sender':sender,'roomName' : roomNameByte, 'msg' :msgByte})

    #byte ordering
    #????

if __name__==  "__main__":
    socketio.run(clientSocket)