import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { Button, Divider, Modal } from 'react-native-paper';
import { rMS, rMV } from '@/styles/responsive';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface ButtonConfig {
  text: string;
  onPress: () => void;
  style?: object;
}

interface ModalComponentProps {
  visible: boolean;
  onDismiss: () => void;
  buttons?: ButtonConfig[];
  children?: React.ReactNode;
  title: string;
  subtitle: string;
  marginVertical?: any;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onDismiss,
  buttons = [],
  children,
  title,
  subtitle,
  marginVertical = null,
}) => {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} onDismiss={onDismiss} style={styles.modal}>
      <KeyboardAvoidingView
        style={[
          styles.keyboardAvoidingView,
          marginVertical && { marginVertical },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.content}>{children}</View>
          {buttons.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.modalButtons}>
                {buttons.map((button, index) => (
                  <React.Fragment key={`${button.text}-${index}`}>
                    <Button
                      onPress={button.onPress}
                      style={styles.button}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </Button>
                    {index < buttons.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const UnsavedModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onDismiss,
  buttons = [],
  children,
  title,
  subtitle,
  marginVertical = null,
}) => {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} onDismiss={onDismiss} style={styles.modal}>
      <KeyboardAvoidingView
        style={[
          styles.keyboardAvoidingView,
          marginVertical && { marginVertical },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.content}>{children}</View>
          {buttons.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.modalButtons}>
                {buttons.map((button, index) => (
                  <React.Fragment key={`${button.text}-${index}`}>
                    <Button
                      onPress={button.onPress}
                      style={styles.button}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </Button>
                    {index < buttons.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface SuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  icon: any; // Puede ser una URL de imagen o un componente de ícono
  duration?: number;
  marginVertical?: any;
  back?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onDismiss,
  title,
  icon,
  duration = 700,
  marginVertical = null,
  back = false,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
        if (back) {
          router.back(); // Navega hacia atrás después de cerrar el modal
        }
      }, duration);
      return () => clearTimeout(timer); // Limpip el temporizador si el componente se desmonta o si visible cambia.
    }
  }, [visible, duration, onDismiss]);
  return (
    <Modal visible={visible} onDismiss={onDismiss} style={successStyle.modal}>
      <KeyboardAvoidingView
        style={[
          successStyle.keyboardAvoidingView,
          marginVertical && { marginVertical },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={successStyle.modalContent}>
          <View style={successStyle.header}>
            <Text style={successStyle.title}>{title}</Text>
            {typeof icon === 'string' ? (
              <Image source={{ uri: icon }} style={successStyle.icon} />
            ) : (
              icon
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    width: rMS(310),
    backgroundColor: '#EBF2ED',
    paddingTop: 20,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: rMS(30),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  title: {
    fontFamily: 'Pro-Regular',
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
    textAlign: 'center', // Asegura que el texto esté centrado
    width: '100%', // Asegura que el subtítulo ocupe todo el ancho disponible
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
  },
  divider: {
    width: '100%',
    backgroundColor: '#486732',
  },
  modalButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    padding: 5,
    minHeight: rMS(20),
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Pro-Regular',
    color: '#486732',
    fontWeight: '600',
    fontSize: rMS(17),
  },
});

const successStyle = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    width: rMS(270),
    backgroundColor: '#EBF2ED',
    paddingTop: 20,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: rMS(30),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  title: {
    fontFamily: 'Pro-Regular',
    color: '#292929',
    fontWeight: 'bold',
    fontSize: rMS(17),
    marginTop: 10,
  },
  icon: {
    width: rMS(50),
    height: rMS(50),
    marginBottom: 10,
  },
});

export { ModalComponent, SuccessModal, UnsavedModalComponent };
