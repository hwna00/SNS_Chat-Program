import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Collapse,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useSocket } from "../hooks";

const RegisterPage = () => {
  const socket = useSocket();

  const { isOpen, onOpen } = useDisclosure();
  const navigate = useNavigate();

  const [domainName, setDomainName] = useState("");
  const [maxConn, setMaxConn] = useState(8);
  const [byte, setBtye] = useState("");
  const [orderedByte, setOrderedByte] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const convertDomainNameToAddress = () => {
    if (domainName === "") {
      return window.alert("도메인 주소를 입력해주세요");
    }

    setIsConverting(true);
    console.log("emit: domain to address");
    socket.emit("domain_to_address");
  };

  const handleDomainNameChange = (event) => {
    setDomainName(event.target.value);
  };

  const handleMaxConnChange = (event) => {
    setMaxConn(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConnecting(true);
    console.log("emit: create server", { domainName, maxConn });
    socket.emit("create_server", { domainName, maxConn });
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("domain_to_address", (payload) => {
      setIsConverting(false);
      onOpen();
      setBtye(payload.byte);
      setOrderedByte(payload.orderedByte);
    });

    socket.on("create_server", () => {
      setIsConnecting(false);
      window.localStorage.setItem("domainName", domainName);
      navigate("/");
    });

    socket.on("error", (payload) => {
      setIsConnecting(false);
      window.alert(payload);
    });
  }, [socket, onOpen, navigate, domainName]);

  return (
    <VStack as="form" onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>개설할 서버의 도메인 주소를 입력하세요</FormLabel>
        <HStack>
          <Input
            required
            value={domainName}
            onChange={handleDomainNameChange}
          />
          <Button
            colorScheme="blue"
            onClick={convertDomainNameToAddress}
            isLoading={isConverting}
          >
            변환하기
          </Button>
        </HStack>
      </FormControl>

      <Collapse style={{ width: "100%" }} in={isOpen} animateOpacity>
        <FormControl>
          <FormLabel>변환된 IP 주소</FormLabel>
          <Input readOnly value={byte} />
        </FormControl>
        <FormControl>
          <FormLabel>변환된 bin 주소</FormLabel>
          <Input readOnly value={orderedByte} />
        </FormControl>
      </Collapse>

      <FormControl>
        <FormLabel>연결 가능한 소켓 개수</FormLabel>
        <Input type="number" value={maxConn} onChange={handleMaxConnChange} />
      </FormControl>

      <Button
        type="submit"
        width="full"
        colorScheme="blue"
        mt="8"
        isLoading={isConnecting}
      >
        서버 생성
      </Button>
    </VStack>
  );
};

export default RegisterPage;
