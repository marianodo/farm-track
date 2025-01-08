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

export default function OneButtonModal({
  isVisible,
  onPress,
  title,
  textOkButton = 'Ok',
  subtitle,
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

        <Divider style={styles.divider} />
        <View
          style={{
            flex: 0.4,
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                // backgroundColor: 'pink',
              },
              pressed ? { backgroundColor: 'rgba(67, 109, 34, 0.2)' } : null,
            ]}
            // style={{
            //   width: '100%',
            //   height: '100%',
            //   justifyContent: 'center',
            //   // backgroundColor: 'pink',
            // }}
            onPress={onPress}
            // rippleColor="#436d22"
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>{textOkButton}</Text>
            </View>
          </Pressable>
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
    minHeight: rMS(180),
    width: rMS(280),
    backgroundColor: '#EBF2ED',
    borderRadius: 10,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
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
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  subtitle: {
    marginTop: rMS(2),
    fontFamily: 'Pro-Regular',
    color: '#292929',
    fontSize: rMS(13),
    lineHeight: 18,
    marginBottom: rMS(20),
    textAlign: 'center',
    width: '100%',
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
