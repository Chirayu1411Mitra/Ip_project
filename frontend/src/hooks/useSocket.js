import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";

/**
 * useSocket — returns the socket instance and registers event listeners
 * with automatic cleanup on unmount or dependency change.
 *
 * Usage:
 *   const { socket, connected } = useSocket({
 *     "receive-message": (data) => handleMessage(data),
 *   });
 */
const useSocket = (eventHandlers = {}) => {
  const { socket, connected } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const entries = Object.entries(eventHandlers);
    entries.forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      entries.forEach(([event, handler]) => socket.off(event, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, ...Object.values(eventHandlers)]);

  return { socket, connected };
};

export default useSocket;
