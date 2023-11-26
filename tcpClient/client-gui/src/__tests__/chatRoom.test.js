import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useSocket } from "../hooks";
import ChatRoom from "../views/ChatRoom";

jest.mock("../hooks");

describe("Chatting Page", () => {
  const mockEmit = jest.fn();
  const mockOn = jest.fn();

  beforeEach(() => {
    useSocket.mockReturnValue({ emit: mockEmit, on: mockOn });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("새로운 사용자가 들어왔을 때 환영 메시지를 보여주는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "welcome") {
        callback();
      }
    });

    render(<ChatRoom />);

    await waitFor(() => {
      expect(
        screen.getByText("새로운 참여자가 입장했습니다.")
      ).toBeIntheDocument();
    });
  });

  it("내가 전송한 메시지가 바이트로 변환된 결과를 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "msg_to_byte") {
        callback({ byte: "pure byte", orderedByte: " ordered byte" });
      }
    });

    render(<ChatRoom />);

    await waitFor(() => {
      expect(screen.getByText("pure byte")).toBeIntheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("ordered byte")).toBeIntheDocument();
    });
  });

  it("채팅방 이용자가 보낸 메시지의 작성자를 구분하여 화면에 표기하는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "recv_msg") {
        callback({ sender: "홍길동", roomName: "홍철범", msg: "반갑수당" });
      }
    });

    render(<ChatRoom />);

    // TODO: 사용자를 구분하는 지 확인할 필요가 있음

    await waitFor(() => {
      expect(screen.getByText("홍길동")).toBeIntheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("반갑수당")).toBeIntheDocument();
    });
  });
});
