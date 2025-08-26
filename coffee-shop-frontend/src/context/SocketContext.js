import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ userInfo, adminInfo, children }) => {
    const [socket, setSocket] = useState(null);
    const API_URL = process.env.REACT_APP_SERVER_URL;

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        const idsToRegister = [];
        if (userInfo?._id) {
            idsToRegister.push(userInfo._id);
        }
        if (adminInfo?.id) {
            idsToRegister.push(adminInfo.id);
        }

        if (idsToRegister.length > 0) {
            newSocket.emit('registerSocketIds', idsToRegister);
        }

        return () => {
            newSocket.close();
        }
    }, [userInfo, adminInfo, API_URL]); // <-- Add API_URL here

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
