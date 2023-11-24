import { renderHook } from "@testing-library/react";

import { useSocket } from "../hooks";
import SocketContext from "../components/SocketContext";
import { mockSocket } from "../mock";

describe("useSocket", () => {
  it("should use socket from context", () => {
    const wrapper = ({ children }) => (
      <SocketContext.Provider value={mockSocket}>
        {children}
      </SocketContext.Provider>
    );

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current).toBe(mockSocket);
  });

  it("변환하기를 클릭하면 변환된 값이 나온다.", () => {});
});
