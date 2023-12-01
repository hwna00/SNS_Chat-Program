from socket import *
from threading import *
import json


class Client_tcp:
    def __init__(self, ip="127.0.0.1", port="9000", timeout=2000):
        self.ip = ip
        self.port = int(port)
        self.timeout = timeout
        self.socket = socket(AF_INET, SOCK_STREAM)
        self.socket.settimeout(timeout)
        self.stop_flag = False

    def connect(self):
        try:
            self.socket.connect((self.ip, self.port))
            print(f"{self.ip}:{self.port} : Connected to Server")
        except TimeoutError as e:
            print(f"{self.ip}:{self.port} : Connection Fail (Timeout Error)")

    def recv(self):
        try:
            while not self.stop_flag:
                if self.socket.fileno() == -1:
                    print(f"{self.ip}:{self.port} : Disconnected by Server")
                    break
                data = self.socket.recv(65535)
                if not data:
                    print(f"{self.ip}:{self.port} : Disconnected from Server")
                    break
                if data.decode() == "SYN-ACK":
                    self.socket.sendall(data)
                elif data.decode() == "SERVER-CLOSE":
                    self.socket.close()
                else:
                    print(f"{self.ip}:{self.port} : {data.decode()}")
        except ConnectionAbortedError as e:
            print(f"{self.ip}:{self.port} : Disconnected from Server")
        except Exception as e2:
            print(f"{self.ip}:{self.port} : Error occured in recv - {e2}")
        finally:
            self.socket.close()
            return

    def send(self, data):
        try:
            self.socket.sendall(json.dumps(data).encode())
            print(f"{self.ip}:{self.port} : Send Success")
        except ConnectionRefusedError as e:
            print(f"{self.ip}:{self.port} : Server closed")
            self.socket.close()
        except Exception as e:
            print(f"{self.ip}:{self.port} : Send Failed - {e}")

    def start_client_tcp(self):
        self.connect()
        self.thread = Thread(target=self.recv, args=())
        self.thread.start()

    def stop_client_tcp(self):
        self.stop_flag = True
        self.socket.close()
        self.thread.join()


if __name__ == "__main__":
    client = Client_tcp("127.0.0.1", "3000")
    client.start_client_tcp()

    while True:
        n = input()
        if n == "quit":
            client.stop_client_tcp()
            break
        client.send(n)
