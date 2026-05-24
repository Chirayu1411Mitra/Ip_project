import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications, markAllNotificationsRead } from "../services/api";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // assuming you have this

const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
                    // avoid logging full notifications response in production
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    useEffect(() => {
        if (!user?._id) return;

        // connect socket for user (do not print raw user id)

        const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
        });

        setSocket(socketInstance);

        // join room
        socketInstance.emit("join", user._id);

        socketInstance.on("newNotification", (newNotif) => {
            // received realtime notification

            setNotifications((prev) => {
                const exists = prev.some((n) => n._id === newNotif._id);
                if (exists) return prev;
                return [newNotif, ...prev];
            });
        });

        return () => {
            // socket disconnecting
            socketInstance.disconnect();
        };
    }, [user?._id]);

    const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.isRead).length : 0;

    useEffect(() => {
        if (user?._id) {
            fetchNotifications();
        }
    }, [user?._id]);

    return (
        <NotifContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                markAllRead,
            }}
        >
            {children}
        </NotifContext.Provider>
    );
};

export const useNotif = () => useContext(NotifContext);