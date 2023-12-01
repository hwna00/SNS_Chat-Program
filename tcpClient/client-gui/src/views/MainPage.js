import { useEffect, useState } from "react";
import { useSocket } from "../hooks";
import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
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
  const [myAddr, setMyAddr] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  const handleDisconnect = () => {
    socket.emit("destroy_connection");
    window.localStorage.removeItem("domainName");
    window.localStorage.removeItem("nickname");
    navigate("/enter-page");
  };

  const handleCreateRoom = () => {
    console.log("clicked");
    if (newRoomName === "") {
      return window.alert("채팅방 이름을 입력하세요");
    }
    socket.emit("create_chat_room", newRoomName);
    setNewRoomName("");
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
    setMyAddr(window.localStorage.getItem("myAddr"));

    socket.emit("chat_rooms");

    socket.on("chat_rooms", (payload) => {
      setChatRooms(payload);
    });

    socket.on("new_msg", (payload) => {
      console.log("new msg: ", payload.msg);
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room.roomName === payload.targetRoom) {
            room.msgPreview = payload.msg;
          }
          return room;
        });
      });
    });

    return () => {
      socket.off("chat_rooms");
      socket.off("new_msg");
    };
  }, [socket, navigate]);

  return (
    <HStack alignItems="flex-start" gap="8">
      <VStack flex="1" alignItems="flex-start" gap="8">
        <Box>
          <Heading as="h3" size="lg">
            My Socket Address
          </Heading>
          <Text>{myAddr}</Text>
        </Box>
        <Box>
          <Heading as="h3" size="lg">
            Server
          </Heading>
          <Text>{serverDomainName}</Text>
        </Box>
        <Box>
          <Heading as="h3" size="lg">
            Nickname
          </Heading>
          <Text>{nickname}</Text>
        </Box>

        <Button
          width="full"
          colorScheme="red"
          onClick={handleDisconnect}
          mt="8"
        >
          연결 해제
        </Button>
      </VStack>

      <VStack flex="1">
        <HStack width="full" mb="8">
          <Input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleCreateRoom}>
            채팅방 생성
          </Button>
        </HStack>
        <UnorderedList width="full" listStyleType="none" spacing="4" margin="0">
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
      </VStack>
    </HStack>
  );
};

export default MainPage;
