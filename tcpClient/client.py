import socket
import threading

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((socket.gethostbyname(socket.gethostname()), 9000))

def recv_data(client_socket):
    try:
        while True:
            data = client_socket.recv(1024)
            print("수신받음 : ", repr(data.decode()))
    except ConnectionAbortedError as e:
        print("서버와 연결 종료")
        return
    return

client_thread = threading.Thread(target=recv_data, args=(client_socket,))
client_thread.start()
print("서버 연결 성공")

while True:
    msg = input()
    if msg == "quit":
        break
    client_socket.send(msg.encode())

client_socket.close()