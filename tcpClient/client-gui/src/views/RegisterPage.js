import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";

const RegisterPage = () => {
  const [domainName, setDomainName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [hexAddress, setHexAddress] = useState("");
  const [nickname, setNickName] = useState("");

  const handleNicknameChange = (event) => {
    setNickName(event.target.value);
  };

  const handleDomainNameChange = (event) => {
    setDomainName(event.target.value);
  };

  const convertDomainNameToAddress = () => {
    console.log(domainName);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("domainName", domainName);
    console.log("ipAddress", ipAddress);
    console.log("hexAddress", hexAddress);
    console.log("nickname", nickname);
  };

  return (
    <VStack as="form" gap="6" onSubmit={handleSubmit}>
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

      <VStack width="full" gap="4">
        <Input readOnly value={ipAddress} />
        <Input readOnly value={hexAddress} />
      </VStack>

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
