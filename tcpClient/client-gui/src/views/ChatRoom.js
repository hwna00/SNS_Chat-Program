import {
  Avatar,
  Button,
  HStack,
  Input,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { useSocket } from "../hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OppositeChatBubble = ({ sender, msg }) => {
  return (
    <VStack justifyContent="center" alignItems="flex-start" gap="1">
      <HStack>
        <Avatar boxSize="6" />
        <Text>{sender}</Text>
      </HStack>
      <Text
        width="fitContent"
        px="4"
        py="1"
        marginLeft="6"
        borderRadius="md"
        borderTopLeftRadius="none"
        bgColor="blue.100"
      >
        {msg}
      </Text>
    </VStack>
  );
};

const MyChatBubble = ({ msg }) => {
  return (
    <HStack width="full" justifyContent="flex-end">
      <Text
        width="fitContent"
        px="4"
        py="1"
        marginLeft="6"
        borderRadius="md"
        borderTopRightRadius="none"
        bgColor="blue.100"
      >
        {msg}
      </Text>
    </HStack>
  );
};

const WelcomeBubble = () => {
  return (
    <HStack justifyContent="center">
      <Text borderRadius="md" px="4" py="1" bgColor="gray.300">
        새로운 참여자가 입장했습니다.
      </Text>
    </HStack>
  );
};

const ChatRoom = () => {
  const socket = useSocket();

  const { roomName } = useParams();
  const [nickname, setNickname] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [chats, setChats] = useState([]);
  const [byte, setByte] = useState("");
  const [orderedByte, setOrderedByte] = useState("");

  const handleInputChange = (event) => {
    setUserMsg(event.target.value);
  };

  const handleMsg = () => {
    if (userMsg !== "") {
      socket.emit("send_msg", {
        sender: nickname,
        roomName,
        msg: userMsg,
      });

      setUserMsg("");
    }
  };

  useEffect(() => {
    setNickname(window.localStorage.getItem("nickname"));

    // TODO: room을 도입하여 채팅방을 나누어야 함
    console.log("emit welcome");
    socket.emit("welcome", roomName);
  }, [socket, roomName]);

  useEffect(() => {
    socket.on("welcome", () => {
      console.log("welcome");
      setChats((prev) => [...prev, "welcome"]);
    });

    socket.on("msg_to_byte", (payload) => {
      console.log("msg to byte", payload);
      setByte(payload.byte);
      setOrderedByte(payload.orderedByte);
    });

    socket.on("recv_msg", (payload) => {
      console.log("recv msg: ", payload);
      setChats((prev) => [...prev, payload]);
    });

    return () => {
      socket.off("welcome");
      socket.off("msg_to_byte");
      socket.off("recv_msg");
    };
  }, [socket, nickname, roomName]);

  return (
    <HStack height="full" alignItems="flex-start">
      <UnorderedList
        flex={1}
        height="full"
        margin="0"
        padding="4"
        listStyleType="none"
        spacing="4"
        borderRadius="sm"
        bgColor="gray.100"
        overflowY="scroll"
      >
        {chats.map((chat, index) => {
          if (typeof chat === "string") {
            return <WelcomeBubble key={index} />;
          }

          if (chat.sender === nickname) {
            return <MyChatBubble key={index} msg={chat.msg} />;
          } else {
            return (
              <OppositeChatBubble
                key={index}
                sender={chat.sender}
                msg={chat.msg}
              />
            );
          }
        })}
      </UnorderedList>

      <VStack flex={1} alignItems="flex-start">
        <HStack width="full" mb="8">
          <Input value={userMsg} onChange={handleInputChange} />
          <Button onClick={handleMsg}>전송</Button>
        </HStack>

        <Input readOnly placeholder="변환 결과" value={byte} />
        <Input readOnly placeholder="정렬 결과" value={orderedByte} />
      </VStack>
    </HStack>
  );
};

export default ChatRoom;
