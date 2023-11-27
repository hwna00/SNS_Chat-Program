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
      const welcomeMessages =
        screen.getAllByText(/새로운 참여자가 입장했습니다\./);
      expect(welcomeMessages.length).toBeGreaterThan(0);
    });
  });

  it("내가 전송한 메시지가 바이트로 변환된 결과를 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "msg_to_byte") {
        callback({ byte: "pure byte", orderedByte: "ordered byte" });
      }
    });

    render(<ChatRoom />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("pure byte")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("ordered byte")).toBeInTheDocument();
    });
  });

  it("채팅방 이용자가 보낸 메시지의 작성자를 구분하여 화면에 표기하는가", async () => {
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.getItem.mockReturnValue("홍세원");

    const messages = [
      { sender: "홍세원", msg: "포항항" },
      { sender: "User2", msg: "Hi there" },
      { sender: "User3", msg: "How are you?" },
    ];

    mockOn.mockImplementation((event, callback) => {
      if (event === "recv_msg") {
        messages.forEach((message) => {
          setTimeout(() => callback(message), 100);
        });
      }
    });

    render(<ChatRoom />);

    await waitFor(() => {
      const opposites = screen.getAllByText("User2");
      expect(opposites[0]).toBeInTheDocument();
    });
    await waitFor(() => {
      const opposites = screen.getAllByText("User3");
      expect(opposites[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      const myName = screen.queryByText("홍세원");
      expect(myName).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByText("포항항")[0]).toBeInTheDocument();
    });
  });
});
