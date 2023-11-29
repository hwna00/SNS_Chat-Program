import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  HStack,
  useDisclosure,
  Collapse,
  Textarea,
} from "@chakra-ui/react";
import { useSocket } from "../hooks";

const RegisterPage = () => {
  const socket = useSocket();

  const [domainName, setDomainName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [hexAddress, setHexAddress] = useState("");
  const [nickname, setNickName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [req, setReq] = useState();
  const [res, setRes] = useState();
  const [isConnected, setIsConnected] = useState(false);

  const { isOpen, onOpen } = useDisclosure();
  const navigate = useNavigate();

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

    console.log("emit create_connection event to server");
    setIsConnecting(true);
    socket.emit("create_connection", { domainName, nickname });
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("domain_to_address", (payload) => {
      console.log("domain_to_address", payload);
      const { ip, hex } = payload;
      onOpen();
      setIpAddress(ip);
      setHexAddress(hex);
    });

    socket.on("handshake_request", (payload) => {
      console.log(payload);
      setReq(payload.msg);
    });

    socket.on("handshake_response", (payload) => {
      console.log(payload);
      setRes(payload.msg);
    });

    socket.on("make_connection", (payload) => {
      if (payload.result) {
        setIsConnected(true);
        window.localStorage.setItem("nickname", nickname);
        window.localStorage.setItem("domainName", domainName);
      } else {
        alert(payload.msg);
      }
    });
  }, [onOpen, socket, nickname, domainName]);

  return (
    <VStack
      as="form"
      gap="6"
      onSubmit={handleSubmit}
      height="full"
      overflow="scroll"
    >
      {!isConnecting ? (
        <>
          <FormControl>
            <FormLabel>Server Domain Name</FormLabel>
            <HStack>
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

          <Button type="submit" width="full" colorScheme="blue">
            연결하기
          </Button>
        </>
      ) : (
        <>
          <FormControl>
            <FormLabel>3-Way Handshake Request</FormLabel>
            <Textarea readOnly value={req} />
          </FormControl>

          <FormControl>
            <FormLabel>3-Way Handshake Response</FormLabel>
            <Textarea readOnly value={res} />
          </FormControl>

          <HStack width="full" gap="8">
            <Button
              flex="1"
              colorScheme="blue"
              isDisabled={!isConnected}
              onClick={() => navigate("/")}
            >
              입장하기
            </Button>
            <Button
              flex="1"
              colorScheme="gray"
              variant="outline"
              onClick={() => setIsConnecting(false)}
            >
              재설정
            </Button>
          </HStack>
        </>
      )}
    </VStack>
  );
};

export default RegisterPage;
