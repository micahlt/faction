import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/** @typedef {import('socket.io-client').Socket} SocketInstance */
/** @typedef {{ children: import('react').ReactNode }} SocketProviderProps */

/** @type {import('react').Context<SocketInstance | undefined>} */
const SocketContext = createContext(undefined);

/**
 * Provides a shared Socket.IO client instance to the React tree.
 * @param {SocketProviderProps} props
 */
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(/** @type {SocketInstance | undefined} */(undefined));
    useEffect(() => {
        setSocket(io('http://localhost:3000', {
            autoConnect: true,
            withCredentials: true,
            secure: false
        }))
        return () => socket?.disconnect();
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

// Custom hook for easy access

/** @returns {SocketInstance | undefined} */
export const useSocket = () => useContext(SocketContext);
