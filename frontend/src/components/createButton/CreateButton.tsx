import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { rMS } from '@/styles/responsive';

const CreateButton = ({
  t,
  onPress,
  text,
}: {
  t?: any;
  onPress: any;
  text?: string;
}) => {
  return (
    //    {/* Botón fijo */}
    <View style={styles.fixedButtonContainer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed ? { backgroundColor: 'rgba(67, 109, 34, 0.2)' } : null,
        ]}
        // style={styles.button}
      >
        <Text style={styles.buttonText}>
          {text ?? t('detailField.createFieldText')}
        </Text>
      </Pressable>
    </View>
  );
};

export default CreateButton;

const styles = StyleSheet.create({
  fixedButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 10, // Añadir espacio debajo del botón
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: rMS(16),
    color: 'white',
    fontFamily: 'Pro-Regular',
  },
});
