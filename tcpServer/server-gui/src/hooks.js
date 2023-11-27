import { useContext } from "react";
import SocketContext from "./components/SocketContext";

export function useSocket() {
  const socket = useContext(SocketContext);
  return socket;
}
