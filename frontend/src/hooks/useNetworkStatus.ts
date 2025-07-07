import { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  wasDisconnected: boolean;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    wasDisconnected: false,
  });

  const prevConnectedRef = useRef<boolean>(true);

  useEffect(() => {
    // Obtener estado inicial
    const getInitialState = async () => {
      const state = await NetInfo.fetch();
      const isCurrentlyConnected = state.isConnected ?? false;
      
      setNetworkState({
        isConnected: isCurrentlyConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        wasDisconnected: false,
      });
      
      prevConnectedRef.current = isCurrentlyConnected;
    };

    getInitialState();

    // Suscribirse a cambios de conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      const isCurrentlyConnected = state.isConnected ?? false;
      const wasConnected = prevConnectedRef.current;
      
      setNetworkState(prevState => ({
        isConnected: isCurrentlyConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        wasDisconnected: wasConnected && !isCurrentlyConnected ? true : prevState.wasDisconnected,
      }));
      
      prevConnectedRef.current = isCurrentlyConnected;
    });

    return () => unsubscribe();
  }, []);

  const resetDisconnectedFlag = () => {
    setNetworkState(prevState => ({
      ...prevState,
      wasDisconnected: false,
    }));
  };

  return {
    ...networkState,
    resetDisconnectedFlag,
  };
}; 