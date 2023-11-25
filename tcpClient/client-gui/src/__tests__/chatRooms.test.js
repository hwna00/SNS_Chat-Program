import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useSocket } from "../hooks";
import MainPage from "../views/MainPage";

jest.mock("../hooks");

describe("Main Page", () => {
  const mockEmit = jest.fn();
  const mockOn = jest.fn();

  const mockChatRooms = [
    {
      roomName: "홍철범",
      msgPreview: "나 하닌데..",
      participants: 3,
    },
  ];

  const mockNewChat = {
    sender: "홍세원",
    msg: "어서오고",
    targetRoom: "홍철범",
  };

  beforeEach(() => {
    useSocket.mockReturnValue({ emit: mockEmit, on: mockOn });
  });

  it("현재 서버에 개설되어 있는 채팅방 목록을 잘 가져오는가?", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "chat_rooms") {
        callback(mockChatRooms);
      }
    });

    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      mockChatRooms.map((room) =>
        expect(
          screen.getByText(new RegExp(room.roomName, "i"))
        ).toBeInTheDocument()
      );
    });
  });

  it("채팅방 목록이 실시간으로 업데이트 되는가?", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "chat_rooms") {
        callback(mockChatRooms);
      } else if (event === "new_msg") {
        callback(mockNewChat);
      }
    });

    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockNewChat.msg)).toBeInTheDocument();
    });
  });
});
