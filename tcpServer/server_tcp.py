from socket import *
from threading import *


class Server_tcp:
    def __init__(self, ip="127.0.0.1", port="9000", max_connection=5):
        self.ip = ip
        self.port = int(port)
        self.socket = socket(AF_INET, SOCK_STREAM)
        self.max_connection = max_connection
        self.stop_flag = False
        self.client_list = []

    def stop_server_tcp(self):
        self.socket.close()
        for clients in self.client_list:
            clients.send(b"SERVER-CLOSE")
        self.stop_flag = True

    def handshaking(self, client_socket, client_addr):
        client_socket.send(b"SYN-ACK")
        data = client_socket.recv(1024)
        if data.decode() == "SYN-ACK":
            print(f"{client_addr[0]}:{client_addr[1]} : Handshaked success")
            return True
        print(f"{client_addr[0]}:{client_addr[1]} : Handshake fail")
        return False

    def client_thread(self, client_socket, client_addr):
        try:
            while True:
                data = client_socket.recv(65535)
                if not data:
                    break
                print(f"{client_addr[0]}:{client_addr[1]} : {data.decode()}")
                for client in self.client_list:
                    client.sendall(data)
        except ConnectionResetError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
        except ConnectionAbortedError as e:
            print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
        if client_socket in self.client_list:
            self.client_list.remove(client_socket)
        print(f"{client_addr[0]}:{client_addr[1]} : Disconnected by User")
        client_socket.close()

    def tcp_server(self):
        try:
            self.socket.bind((self.ip, self.port))
            self.socket.listen()
            print(f"Server Started at {self.ip}:{self.port}")
            while not self.stop_flag:
                client_socket, client_addr = self.socket.accept()
                if len(self.client_list) >= self.max_connection:
                    print(f"Server connection Fail : MAX CONNECTION ERROR")
                    client_socket.close()
                    continue
                if self.handshaking(client_socket, client_addr) is False:
                    print(f"Server connection Fail : HANDSHAKING ERROR")
                    client_socket.close()
                    continue
                self.client_list.append(client_socket)
                client = Thread(
                    target=self.client_thread, args=(client_socket, client_addr)
                )
                print(
                    f"{client_addr[0]}:{client_addr[1]} : Connected {len(self.client_list)}/{self.max_connection}"
                )
                client.start()
            self.socket.close()
        except OSError as e:
            print(f"Server Closed by User")

    def start_tcp_server(self):
        server_thread = Thread(target=self.tcp_server, args=())
        server_thread.start()


if __name__ == "__main__":
    server = Server_tcp()
    server.start_tcp_server()
    while True:
        n = input()
        if n == "quit":
            server.stop_server_tcp()
            break
