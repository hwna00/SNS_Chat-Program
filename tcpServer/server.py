from socket import *
from threading import *

clients = []

def make_listening_socket(IP, HOST) -> socket:
    server_socket = socket(AF_INET, SOCK_STREAM) # TCP/IP Protocol
    server_socket.bind((IP, HOST))
    server_socket.settimeout(2000)
    return server_socket

def handshaking(server_socket, client_socket, addr) -> bool:
    print(f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Accept SYN from client({addr[0]}:{addr[1]})")
    client_socket.sendall(b"SYN-ACK")
    print(f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Send SYN-ACK to client({addr[0]}:{addr[1]})")
    data = client_socket.recv(1024)
    print(f"{addr[0]}:{addr[1]} : Received SYN-ACK data({data.decode()})")
    if (data.decode() == "SYN-ACK"): 
        return True
    return False

def client_thread(client_socket, addr):
    global clients
    try:
        while True:
            data = client_socket.recv(65535)
            if not data: break
            print(f"{addr[0]}:{addr[1]} : {data.decode()}")
            for client in clients:
                client.sendall(data)
    except ConnectionResetError as e:
        print(f"{addr[0]}:{addr[1]} : Disconnected by User")
    if client_socket in clients:
        clients.remove(client_socket)
    client_socket.close()
            
def start_server(server_socket : socket, max_connection : int) -> int:
    global clients
    server_socket.listen()
    print(f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : Server Started ...")
    while not stop_server_flag: # Input flag here
        client_socket, addr = server_socket.accept()
        if (len(clients) >= max_connection):
            print(f"{addr[0]}:{addr[1]} : Accept Denied - Max Connection Error")
            client_socket.close(); continue
        if (handshaking(server_socket, client_socket, addr) is False):
            print(f"{addr[0]}:{addr[1]} : Accept Denied - 3-way-handshaking Error")
            client_socket.close(); continue
        client = Thread(target=client_thread, args=(client_socket, addr))
        clients.append(client_socket)
        print(f"{addr[0]}:{addr[1]} : Connected Successfully")
        print(f"{server_socket.getsockname()[0]}:{server_socket.getsockname()[1]} : {len(clients)} connected to server")
        client.start()
    server_socket.close()

if __name__ == "__main__":
    server_socket = make_listening_socket("127.0.0.1", 9000)
    stop_server_flag = False
    server = Thread(target=start_server, args=(server_socket, 5))
    server.start()
    while True:
        s = input("Input : ")
        if s == "end":
            stop_server_flag = True
            server.join()
            break
    