import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import RegisterPage from "../views/RegisterPage";
import { useSocket } from "../hooks";

jest.mock("../hooks");

describe("Register Page", () => {
  window.alert = jest.fn();
  window.scrollTo = jest.fn();

  it("도메인 네임 변환 버튼 클릭 시, ip 주소 값과 hex 주소 값을 가져와야 한다", async () => {
    const mockEmit = jest.fn();
    const mockOn = jest.fn((event, callback) => {
      if (event === "domain_to_address") {
        callback({ ip: "192.168.1.1", hex: "C0A80101" });
      }
    });
    useSocket.mockReturnValue({ emit: mockEmit, on: mockOn });

    render(<RegisterPage />);
    fireEvent.change(
      screen.getByPlaceholderText(
        "연결하고자 하는 서버의 도메인 주소를 입력하세요",
        { target: { value: "test value" } }
      )
    );
    fireEvent.click(screen.getByText("변환하기"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("192.168.1.1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("C0A80101")).toBeInTheDocument();
    });
  });

  window.alert.mockRestore();
  window.scrollTo.mockRestore();
});