import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useSocket } from "../hooks";
import RegisterPage from "../views/RegisterPage";
import { MemoryRouter } from "react-router-dom";

jest.mock("../hooks");

describe("Main Page", () => {
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

  it("사용자가 입력한 서버의 도메인 주소를 변환한 값이 나타나는가", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "domain_to_address") {
        callback({ byte: "byte", orderedByte: "orderedByte" });
      }
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("byte")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("orderedByte")).toBeInTheDocument();
    });
  });
});
