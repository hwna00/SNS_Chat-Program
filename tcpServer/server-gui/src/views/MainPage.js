import { useState, useEffect } from "react";
import {
  HStack,
  VStack,
  Text,
  UnorderedList,
  ListItem,
  Box,
  Heading,
  Button,
} from "@chakra-ui/react";

import { AnimatePresence, motion } from "framer-motion";
import { useSocket } from "../hooks";

const MainPage = () => {
  const socket = useSocket();

  const [serverDomain, setServerDomain] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clientSockAddrs, setClientSockAddrs] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [socketConn, setSocketConn] = useState({});

  useEffect(() => {
    setServerDomain(window.localStorage.getItem("domainName"));
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("conn_info", (payload) => {
      console.log(payload);
      setSocketConn(payload);
    });

    socket.emit("client_connected");

    socket.on("clients", (payload) => {
      console.log("clients: ", payload);
      setClientSockAddrs(payload);
    });

    socket.on("new_msg", (payload) => {
      console.log(payload);
      setMessages((prev) => [payload, ...prev]);
    });

    return () => {
      socket.off("conn_info");
      socket.off("clients");
      socket.off("new_msg");
    };
  }, [socket]);

  return (
    <HStack height="full" alignItems="flex-start">
      <VStack flex={1} height="full" alignItems="flex-start">
        <HStack>
          <Text fontWeight="bold">현재 서버 주소:</Text>
          <Text>{serverDomain}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">연결 가능한 소켓 개수:</Text>
          <Text>
            {socketConn.currConn}/{socketConn.maxConn}
          </Text>
        </HStack>

        <Heading as="h1" fontSize="lg" mt="8">
          연결된 소켓 목록
        </Heading>
        <UnorderedList
          width="full"
          height="full"
          listStyleType="none"
          margin="0"
          padding="4"
          spacing="4"
          overflowY="scroll"
          bgColor="gray.100"
        >
          {clientSockAddrs.map((client) => (
            <ListItem
              as={motion.div}
              layoutId={client}
              onClick={() => setSelectedClient(client)}
              key={client}
              padding="4"
              borderRadius="sm"
              bgColor="blue.100"
            >
              <HStack>
                <Text>클라이언트 소켓 주소:</Text>
                <Text>{client}</Text>
              </HStack>
            </ListItem>
          ))}
        </UnorderedList>

        <AnimatePresence>
          {selectedClient && (
            <Box
              position="absolute"
              width="50%"
              height="80%"
              top="10%"
              left="25%"
              as={motion.div}
              layoutId={selectedClient}
              padding="4"
              bgColor="gray.100"
              borderRadius="md"
            >
              <Heading as="h1" fontSize="2xl" mb="8">
                {selectedClient}
              </Heading>
              {messages
                ?.filter((msg) => {
                  return msg.clientSockAddr === selectedClient;
                })
                .map((msg, index) => (
                  <VStack
                    as="li"
                    key={index}
                    padding="4"
                    bgColor="blue.100"
                    mt="4"
                    alignItems="flex-start"
                    width="full"
                    overflowX="scroll"
                  >
                    <Text>보낸 사람: {msg.sender}</Text>
                    <Text>채팅방: {msg.target}</Text>
                    <Text>받은 바이트: {msg.byte}</Text>
                    <Text>정렬된 바이트: {msg.orderedByte}</Text>
                    <Text>해석 결과: {msg.msg}</Text>
                  </VStack>
                ))}
              <Button
                as={motion.button}
                colorScheme="red"
                variant="ghost"
                position="absolute"
                top="4"
                right="4"
                onClick={() => setSelectedClient(null)}
              >
                닫기
              </Button>
            </Box>
          )}
        </AnimatePresence>
      </VStack>

      <UnorderedList
        flex={1}
        height="full"
        bgColor="gray.100"
        overflowY="scroll"
        spacing="4"
        padding="4"
      >
        {messages?.map((msg, index) => (
          <VStack
            width="full"
            as="li"
            key={index}
            padding="4"
            bgColor="blue.100"
            alignItems="flex-start"
            overflowX="scroll"
          >
            <Text>보낸 사람: {msg.sender}</Text>
            <Text>채팅방: {msg.target}</Text>
            <Text>받은 바이트: {msg.byte}</Text>
            <Text>정렬된 바이트: {msg.orderedByte}</Text>
            <Text>내용: {msg.msg}</Text>
          </VStack>
        ))}
      </UnorderedList>
    </HStack>
  );
};

export default MainPage;
