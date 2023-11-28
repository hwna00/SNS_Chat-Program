import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { useSocket } from "../hooks";
import RegisterPage from "../views/RegisterPage";
import MainPage from "../views/MainPage";

jest.mock("../hooks");

describe("Main Page", () => {
  const mockEmit = jest.fn();
  const mockOn = jest.fn();

  beforeEach(() => {
    window.alert = jest.fn();

    useSocket.mockReturnValue({ emit: mockEmit, on: mockOn });
  });

  afterEach(() => {
    window.alert.mockRestore();

    jest.clearAllMocks();
  });

  it("현재 실행중인 서버 주소를 확인할 수 있는가", () => {
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.getItem.mockReturnValue("localhost:3000");

    render(<MainPage />);

    expect(screen.getByText("localshot:3000")).toBeInTheDocument();
  });

  it("현재 서버에 연결된 소켓의 개수를 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "conn_info") {
        callback({ maxConn: "8", currConn: "3" });
      }
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText(/8/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  it("현재 서버에 연결된 소켓 목록을 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "clients") {
        callback([
          {
            nickname: "홍세원",
            socketAddr: "localhost:54732",
          },
          {
            nickname: "조항범",
            socketAddr: "localhost:48823",
          },
        ]);
      }
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText(/홍세원/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/조항범/)).toBeInTheDocument();
    });
  });

  it("전체 데이터 전송 내역을 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "msgs") {
        callback([
          {
            sender: "하철환",
            msg: "반갑수당",
            byte: "byte",
            orderedByte: "orderedByte",
            target: "홍철범",
          },
        ]);
      }
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText("하철환")).toBeInTheDocument();
    });
  });

  it("특정 소켓의 데이터 전송 내역을 확인할 수 있는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "msgs") {
        callback([
          {
            sender: "하철환",
            msg: "반갑수당",
            byte: "byte",
            orderedByte: "orderedByte",
            target: "홍철범",
          },
        ]);
      } else if (event === "clients") {
        callback([
          {
            nickname: "하철환",
            socketAddr: "localhost:54732",
          },
        ]);
      }
    });

    render(<MainPage />);

    fireEvent.click(screen.getAllByText("하철환")[0]);

    await waitFor(() => {
      expect(screen.getByText("반갑수당")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("하철환")).toBeInTheDocument();
    });
  });
});
