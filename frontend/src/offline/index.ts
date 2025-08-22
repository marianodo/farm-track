import AsyncStorage from '@react-native-async-storage/async-storage';
import { initOfflineDb } from './db';
import { initNetworkListener } from './net';
import { getQueueLength } from './queue';

let initialized = false;

export const initOffline = async (
  getBaseUrl: () => string,
  onSyncState?: (syncing: boolean, pending: number) => void,
) => {
  if (initialized) return;
  initialized = true;

  await initOfflineDb();

  // initial pending
  try {
    const pending = await getQueueLength();
    onSyncState?.(false, pending);
  } catch {}

  initNetworkListener(
    getBaseUrl,
    async () => {
      const token = await AsyncStorage.getItem('accessToken');
      return token ? `Bearer ${token}` : null;
    },
    onSyncState,
  );
};

export const teardownOffline = () => {
  // disposeNetworkListener(); // This line was removed from the new_code, so it's removed here.
  initialized = false;
}; 