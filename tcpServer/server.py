import socket
import threading

client_sockets = []

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
