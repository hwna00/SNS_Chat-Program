import {
  Avatar,
  Button,
  HStack,
  Input,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";

const ChatBubble = () => {
  return (
    <VStack justifyContent="center" alignItems="flex-start" gap="1">
      <Avatar boxSize="6" />
      <Text
        width="fitContent"
        px="4"
        py="1"
        marginLeft="6"
        borderRadius="md"
        borderTopLeftRadius="none"
        bgColor="blue.100"
      >
        hihihihihihihihihihi
      </Text>
    </VStack>
  );
};

const ChatRoom = () => {
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
        <ChatBubble />
        <ChatBubble />
        <ChatBubble />
      </UnorderedList>

      <VStack flex={1} alignItems="flex-start">
        <HStack width="full" mb="8">
          <Input />
          <Button>전송</Button>
        </HStack>

        <Input readOnly placeholder="변환 결과" />
        <Input readOnly placeholder="정렬 결과" />
      </VStack>
    </HStack>
  );
};

export default ChatRoom;
