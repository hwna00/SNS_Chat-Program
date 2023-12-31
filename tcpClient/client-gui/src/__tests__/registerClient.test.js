import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../views/RegisterPage";
import { useSocket } from "../hooks";

jest.mock("../hooks");

describe("Register Page", () => {
  const mockEmit = jest.fn();
  const mockOn = jest.fn();

  beforeEach(() => {
    window.alert = jest.fn();
    window.scrollTo = jest.fn();
    useSocket.mockReturnValue({ emit: mockEmit, on: mockOn });
  });

  afterEach(() => {
    window.alert.mockRestore();
    window.scrollTo.mockRestore();
    jest.clearAllMocks();
  });

  it("도메인 네임 변환 버튼 클릭 시, ip 주소 값과 hex 주소 값을 가져와야 한다", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "domain_to_address") {
        callback({ ip: "192.168.1.1", hex: "C0A80101" });
      }
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "연결하고자 하는 서버의 도메인 주소를 입력하세요"
      ),
      { target: { value: "test value" } }
    );
    fireEvent.click(screen.getByText("변환하기"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("192.168.1.1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("C0A80101")).toBeInTheDocument();
    });
  });

  it("연결하기 버튼 클릭 시, 3-way handshake 과정을 확인할 수 있어야 한다.", async () => {
    mockOn.mockImplementation((event, callback) => {
      switch (event) {
        case "handshake_request":
          callback({ msg: "handshake_request" });
          break;
        case "handshake_response":
          callback({ msg: "handshake_response" });
          break;
        case "create_connection":
          callback({ msg: "create_connection" });
          break;
        default:
          break;
      }
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "연결하고자 하는 서버의 도메인 주소를 입력하세요"
      ),
      { target: { value: "test value" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("채팅에서 사용할 닉네임을 입력해주세요"),
      { target: { value: "nickname" } }
    );
    fireEvent.click(screen.getByText("연결하기"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("handshake_request")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("handshake_response")
      ).toBeInTheDocument();
    });
  });
});
