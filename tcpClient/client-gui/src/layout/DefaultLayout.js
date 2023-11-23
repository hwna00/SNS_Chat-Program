import { Container, HStack, Heading, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const DefaultLayout = () => {
  return (
    <VStack width="100vw" height="100vh">
      <HStack width="full" padding="4" boxShadow="base">
        <Heading
          as="h1"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
        >
          SNS TALK
        </Heading>
      </HStack>
      <Container>
        <Outlet />
      </Container>
    </VStack>
  );
};

export default DefaultLayout;
