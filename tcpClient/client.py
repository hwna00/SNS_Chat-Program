from socket import *
from threading import *

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
            data = client_socket.recv(65535)
            if data.decode() == "SYN-ACK":
                client_socket.sendall(b"SYN-ACK")
            print(f"{addr[0]}:{addr[1]} : {data.decode()}")
    except ConnectionAbortedError as e:
        print(f"{addr[0]}:{addr[1]} : Disconnected from server")
    return

def send(client_socket, addr, data):
    try:
        client_socket.sendall(data.decode())
        print(f"{addr[0]}:{addr[1]} : Send successful")
    except Exception as e:
        print(f"{addr[0]}:{addr[1]} : Send Failed - {e}")
    return

if __name__ == "__main__":
    addr = ("127.0.0.1", 9000)
    client_socket = connect(addr)
    client = Thread(target=recv, args=(client_socket, addr))
    client.start()
    while True:
        data = input("Input : ")
        if data == "quit":
            client_socket.close(); break
        client_socket.send(data.encode())
    
