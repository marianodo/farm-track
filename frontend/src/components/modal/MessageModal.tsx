import { Modal, View, Text, Pressable, StyleSheet, Image } from 'react-native';
// import React from 'react';
import { IconButton } from 'react-native-paper';
import { rMS } from '@/styles/responsive';
import { useTranslation } from 'react-i18next';

type SuccessModalProps = {
  isVisible: boolean;
  message?: string | null;
  success?: boolean;
  onClose?: any;
  icon?: any;
};

export default function MessageModal({
  isVisible,
  message,
  success = true,
  icon,
  onClose,
}: SuccessModalProps) {
  const { t } = useTranslation();
  // console.log('ESTE ES EL ONCLOSE', onClose);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        onClose ? onClose() : undefined;
      }}
    >
      <View style={styles.overlay} />
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {message && message.trim().length
              ? message
              : success
              ? t('modal.successMessage')
              : t('modal.errorMessage')}
          </Text>
          {icon ? (
            icon
          ) : (
            <IconButton
              icon={success ? 'check-circle-outline' : 'alert-decagram-outline'}
              iconColor={success ? '#486732' : '#B82E2E'}
              size={rMS(82)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Color negro con 50% de opacidad
  },
  modalContent: {
    // minHeight: '25%',
    minHeight: rMS(200),
    width: rMS(280),
    backgroundColor: '#EBF2ED',
    borderRadius: 10,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: '-50%' }, // Centra horizontalmente
      { translateY: '-50%' }, // Centra verticalmente
    ],
  },
  header: {
    flex: 1,
    // backgroundColor: 'green',
    paddingHorizontal: rMS(30),
    marginTop: rMS(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  title: {
    fontFamily: 'Pro-Bold',
    color: '#292929',
    fontWeight: 'bold',
    fontSize: rMS(17),
    textAlign: 'center', // Asegura que el texto esté centrado
    flexWrap: 'wrap', // Permite que el texto se ajuste
    width: '100%', // Asegura que el título ocupe todo el ancho disponible
  },
  subtitle: {
    marginTop: rMS(2),
    fontFamily: 'Pro-Regular',
    color: '#292929',
    fontSize: rMS(13),
    lineHeight: 18,
    marginBottom: rMS(20),
    textAlign: 'center',
    // textAlign: 'center', // Asegura que el texto esté centrado
    width: '100%', // Asegura que el subtítulo ocupe todo el ancho disponible
  },
});
