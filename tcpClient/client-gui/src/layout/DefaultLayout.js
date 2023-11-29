import { useEffect, useState } from "react";

import { Outlet } from "react-router-dom";
import { Container, HStack, Heading, VStack } from "@chakra-ui/react";
import { io } from "socket.io-client";

import SocketContext from "../components/SocketContext";

const DefaultLayout = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const webSocket = io("http://localhost:8001");
    setSocket(webSocket);

    webSocket.on("error", (payload) => {
      window.alert(payload);
    });

    return () => webSocket.close();
  }, []);

  return (
    <VStack width="100vw" height="100vh" gap="4">
      <HStack width="full" padding="4" boxShadow="base">
        <Heading
          as="h1"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
        >
          SNS TALK
        </Heading>
      </HStack>
      <Container maxW="container.lg" height="full" py="4">
        <SocketContext.Provider value={socket}>
          <Outlet />
        </SocketContext.Provider>
      </Container>
    </VStack>
  );
};

export default DefaultLayout;
