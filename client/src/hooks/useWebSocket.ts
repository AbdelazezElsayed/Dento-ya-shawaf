import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
    onConnect?: () => void;
    onDisconnect?: () => void;
    autoReconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { onConnect, onDisconnect, autoReconnect = true } = options;
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Create WebSocket connection
        const socket = io({
            withCredentials: true,
            autoConnect: true,
            reconnection: autoReconnect,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            onConnect?.();
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            onDisconnect?.();
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [onConnect, onDisconnect, autoReconnect]);

    // Subscribe to an event
    const subscribe = <T,>(event: string, handler: (data: T) => void) => {
        socketRef.current?.on(event, handler);
        return () => {
            socketRef.current?.off(event, handler);
        };
    };

    // Emit an event
    const emit = (event: string, data?: any) => {
        socketRef.current?.emit(event, data);
    };

    // Subscribe to doctor queue updates
    const subscribeToDoctorQueue = (doctorId: string) => {
        emit('subscribe:doctor-queue', doctorId);
    };

    const unsubscribeFromDoctorQueue = (doctorId: string) => {
        emit('unsubscribe:doctor-queue', doctorId);
    };

    return {
        isConnected,
        subscribe,
        emit,
        subscribeToDoctorQueue,
        unsubscribeFromDoctorQueue,
        socket: socketRef.current,
    };
}
