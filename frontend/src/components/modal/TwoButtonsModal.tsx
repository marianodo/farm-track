import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, Divider } from 'react-native-paper';
import { rMS } from '@/styles/responsive';
import { useTranslation } from 'react-i18next';

type ButtonConfig = {
  text: string;
  onPress: () => void;
  style?: object;
};

type ModalComponentProps = {
  isVisible: boolean;
  onDismiss: () => void;
  buttons?: ButtonConfig[];
  title: string;
  subtitle?: string;
  textOkButton?: string;
  textCancelButton?: string | null;
  onPress: () => void;
  vertical?: boolean;
};

export default function TwoButtonsModal({
  isVisible,
  onDismiss,
  onPress,
  title,
  textOkButton = 'Ok',
  textCancelButton,
  subtitle,
  vertical = false,
}: ModalComponentProps) {
  const { t } = useTranslation();
  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={styles.overlay} />
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {vertical ? (
          <>
            <Divider style={styles.divider} />
            <View style={styles.modalButtons}>
              <Button
                onPress={onPress}
                style={styles.button}
                rippleColor="#436d22"
              >
                <Text style={styles.buttonText}>{textOkButton}</Text>
              </Button>
              <Divider style={styles.divider} />
              <Button
                onPress={onDismiss}
                style={styles.button}
                rippleColor="#436d22"
              >
                <Text style={styles.buttonText}>
                  {textCancelButton
                    ? textCancelButton
                    : t('fieldView.deleteAlertText')}
                </Text>
              </Button>
            </View>
          </>
        ) : (
          <>
            <Divider style={styles.divider} />
            <View
              style={{
                // backgroundColor: 'red',
                flex: 0.4,
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
              }}
            >
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button
                  onPress={onDismiss}
                  rippleColor="#436d22"
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>
                    {textCancelButton
                      ? textCancelButton
                      : t('fieldView.deleteAlertText')}
                  </Text>
                </Button>
              </View>
              <View
                style={{
                  width: Platform.OS === 'ios' ? 0.6 : 0.3, // Ancho de la línea
                  height: '100%', // Alto relativo al contenedor
                  backgroundColor: '#486732', // Color de la línea
                  alignSelf: 'center', // Centrado verticalmente
                }}
              />
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button
                  onPress={onPress}
                  rippleColor="#436d22"
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{textOkButton}</Text>
                </Button>
              </View>
            </View>
          </>
        )}
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
    minHeight: rMS(180),
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
  content: {
    alignItems: 'center',
    // marginTop: 20,
  },
  divider: {
    width: '100%',
    backgroundColor: '#486732',
  },
  modalButtons: {
    height: rMS(90),
    width: '100%',
    // backgroundColor: 'red',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: rMS(10),
    minHeight: rMS(20),
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Pro-Medium',
    color: '#486732',
    fontWeight: '600',
    fontSize: rMS(17),
  },
});
