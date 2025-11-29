import { API_URl } from "@/exportdata";
import { io } from "socket.io-client";

const apiUrl = API_URl || "";


export const socket = io(apiUrl, {
  transports: ["websocket"],
  reconnection: true,
  autoConnect: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
});
