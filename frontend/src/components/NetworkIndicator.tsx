import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Snackbar, Icon } from 'react-native-paper';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';
import { rMS, rV } from '../styles/responsive';

const { width } = Dimensions.get('window');

export const NetworkIndicator: React.FC = () => {
  const { isConnected, isInternetReachable, resetDisconnectedFlag } = useNetworkStatus();
  const { t } = useTranslation();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [showPersistentBar, setShowPersistentBar] = useState(false);

  useEffect(() => {
    if (!isConnected || isInternetReachable === false) {
      // Sin conexión - mostrar barra persistente
      setShowPersistentBar(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Con conexión - ocultar barra y mostrar snackbar de reconexión si venía desconectado
      if (showPersistentBar) {
        setShowSnackbar(true);
        resetDisconnectedFlag();
      }
      
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowPersistentBar(false);
      });
    }
  }, [isConnected, isInternetReachable, showPersistentBar]);

  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        message: t('network.noConnection'),
        color: '#D32F2F',
        icon: 'wifi-off',
      };
    } else if (isInternetReachable === false) {
      return {
        message: t('network.noInternet'),
        color: '#F57C00',
        icon: 'wifi-strength-1',
      };
    }
    return null;
  };

  const connectionStatus = getConnectionStatus();

  return (
    <>
      {/* Barra persistente para sin conexión */}
      {showPersistentBar && connectionStatus && (
        <Animated.View
          style={[
            styles.persistentBar,
            { backgroundColor: connectionStatus.color, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Icon source={connectionStatus.icon} size={rMS(16)} color="white" />
          <Text style={styles.persistentText}>{connectionStatus.message}</Text>
        </Animated.View>
      )}

      {/* Snackbar para reconexión */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: '#4CAF50' }]}
        action={{
          label: t('network.dismiss'),
          onPress: () => setShowSnackbar(false),
          textColor: 'white',
        }}
      >
        <View style={styles.snackbarContent}>
          <Icon source="wifi" size={rMS(16)} color="white" />
          <Text style={styles.snackbarText}>{t('network.reconnected')}</Text>
        </View>
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  persistentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: rV(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rMS(16),
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  persistentText: {
    color: 'white',
    fontSize: rMS(12),
    fontWeight: '600',
    marginLeft: rMS(8),
    fontFamily: 'Pro-Regular',
  },
  snackbar: {
    position: 'absolute',
    bottom: rV(20),
    left: rMS(16),
    right: rMS(16),
    borderRadius: rMS(8),
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarText: {
    color: 'white',
    fontSize: rMS(14),
    fontWeight: '500',
    marginLeft: rMS(8),
    fontFamily: 'Pro-Regular',
  },
}); 