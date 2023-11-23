import { useEffect, useState } from "react";
import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  HStack,
  useDisclosure,
  Collapse,
} from "@chakra-ui/react";
import { useSocket } from "../hooks";

const RegisterPage = () => {
  const socket = useSocket();

  const [domainName, setDomainName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [hexAddress, setHexAddress] = useState("");
  const [nickname, setNickName] = useState("");

  const { isOpen, onOpen } = useDisclosure();

  const handleNicknameChange = (event) => {
    setNickName(event.target.value);
  };

  const handleDomainNameChange = (event) => {
    setDomainName(event.target.value);
  };

  const convertDomainNameToAddress = () => {
    if (domainName !== "") {
      console.log("emit domain_to_address event to server");
      socket.emit("domain_to_address", { domainName });
    } else {
      window.alert("도메인 주소를 입력해주세요");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("domainName", domainName);
    console.log("ipAddress", ipAddress);
    console.log("hexAddress", hexAddress);
    console.log("nickname", nickname);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("domain_to_address", (payload) => {
      const { ip, hex } = payload;
      onOpen();
      setIpAddress(ip);
      setHexAddress(hex);
    });
  }, [onOpen, socket]);

  return (
    <VStack as="form" gap="6" onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>Server Domain Name</FormLabel>
        <HStack>
          {/* // TODO: 입력 형식을 지정해야 한다. */}
          <Input
            required
            placeholder="연결하고자 하는 서버의 도메인 주소를 입력하세요"
            value={domainName}
            onChange={handleDomainNameChange}
          />
          <Button colorScheme="blue" onClick={convertDomainNameToAddress}>
            변환하기
          </Button>
        </HStack>
      </FormControl>

      <Collapse style={{ width: "100%" }} in={isOpen} animateOpacity>
        <VStack width="full" gap="4">
          <Input readOnly value={ipAddress} />
          <Input readOnly value={hexAddress} />
        </VStack>
      </Collapse>

      <FormControl>
        <FormLabel>Nickname</FormLabel>
        <Input
          required
          placeholder="채팅에서 사용할 닉네임을 입력해주세요"
          value={nickname}
          onChange={handleNicknameChange}
        />
      </FormControl>
      <Button type="submit" width="full" colorScheme="blue" mt="8">
        연결하기
      </Button>
    </VStack>
  );
};

export default RegisterPage;
