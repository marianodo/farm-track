import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';

interface CacheIndicatorProps {
  isFromCache: boolean;
  visible?: boolean;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({ 
  isFromCache, 
  visible = true 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Badge
        style={[
          styles.badge,
          isFromCache ? styles.cacheBadge : styles.networkBadge
        ]}
        size={20}
      >
        {isFromCache ? '⚡ CACHE' : '🌐 NETWORK'}
      </Badge>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cacheBadge: {
    backgroundColor: '#4CAF50',
  },
  networkBadge: {
    backgroundColor: '#FF9800',
  },
});

export default CacheIndicator; 