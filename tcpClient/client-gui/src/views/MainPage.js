import { useEffect, useState } from "react";
import { useSocket } from "../hooks";
import {
  Button,
  HStack,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [serverDomainName, setserverDomainName] = useState("");
  const [chatRooms, setChatRooms] = useState([]);

  const handleDisconnect = () => {
    socket.emit("destroy_connection");
    navigate("/enter-page");
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (!window.localStorage.getItem("nickname")) {
      navigate("/enter-page");
    }

    setNickname(window.localStorage.getItem("nickname"));
    setserverDomainName(window.localStorage.getItem("domainName"));

    socket.emit("chat_rooms");

    socket.on("chat_rooms", (payload) => {
      setChatRooms(payload);
    });
    socket.on("new_msg", (payload) => {
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room.roomName === payload.targetRoom) {
            room.msgPreview = payload.msg;
          }
          return room;
        });
      });
    });
  }, [socket, navigate]);

  return (
    <HStack>
      <VStack flex="1" alignItems="flex-start">
        <Heading as="h3" size="lg">
          Nickname
        </Heading>
        <Text>{nickname}</Text>
        <Heading as="h3" size="lg">
          Server
        </Heading>
        <Text>{serverDomainName}</Text>
        <Button width="full" colorScheme="red" onClick={handleDisconnect}>
          연결 해제
        </Button>
      </VStack>

      <UnorderedList flex="1" listStyleType="none" spacing="4">
        {chatRooms?.map((room) => (
          <ListItem
            key={room.roomName}
            bgColor="blue.50"
            padding="4"
            borderRadius="md"
            cursor="pointer"
            onClick={() => {
              navigate(`rooms/${room.roomName}`);
            }}
          >
            <Text fontWeight="bold">
              {room.roomName} ({room.participants}명)
            </Text>
            <Text textAlign="right">{room.msgPreview}</Text>
          </ListItem>
        ))}
      </UnorderedList>
    </HStack>
  );
};

export default MainPage;
