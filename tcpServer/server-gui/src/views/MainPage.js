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
  const [socketClients, setSocketClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [socketConn, setSocketConn] = useState({});

  useEffect(() => {
    setServerDomain(window.localStorage.getItem("domainName"));

    if (!socket) {
      return;
    }

    socket.on("conn_info", (payload) => {
      setSocketConn(payload);
    });

    socket.on("clients", (payload) => {
      setSocketClients(payload);
    });

    socket.on("msgs", (payload) => {
      setMessages((prev) => [...prev, payload]);
    });
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
          {socketClients.map((client, index) => (
            <ListItem
              as={motion.div}
              layoutId={client.nickname}
              onClick={() => setSelectedClient(client)}
              key={index}
              padding="4"
              borderRadius="sm"
              bgColor="blue.100"
            >
              <HStack>
                <Text>클라이언트 닉네임:</Text> <Text>{client.nickname}</Text>
              </HStack>
              <HStack>
                <Text>클라이언트 소켓 주소:</Text>
                <Text>{client.socketAddr}</Text>
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
              layoutId={selectedClient.nickname}
              padding="4"
              bgColor="gray.100"
              borderRadius="md"
            >
              <Heading as="h1" fontSize="2xl" mb="8">
                {selectedClient.nickname}({selectedClient.socketAddr})
              </Heading>
              {messages
                ?.filter((msg) => {
                  return msg.sender === selectedClient.nickname;
                })
                .map((msg, index) => (
                  <VStack
                    as="li"
                    key={index}
                    padding="4"
                    bgColor="blue.100"
                    mt="4"
                    alignItems="flex-start"
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
            as="li"
            key={index}
            padding="4"
            bgColor="blue.100"
            alignItems="flex-start"
          >
            <Text>보낸 사람: {msg.sender}</Text>
            <Text>채팅방: {msg.target}</Text>
            <Text>받은 바이트: {msg.byte}</Text>
            <Text>정렬된 바이트: {msg.orderedByte}</Text>
          </VStack>
        ))}
      </UnorderedList>
    </HStack>
  );
};

export default MainPage;
