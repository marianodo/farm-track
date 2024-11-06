import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const CustomDropDown = ({
  placeholder,
  placeholderStyle,
  style,
  dropDownContainerStyle,
  listMode,
  zIndex,
  zIndexInverse,
  arrowIconStyle,
  open,
  value,
  items,
  setValue,
  onChangeValue,
  multiple,
  mode,
  badgeDotColors,
  dropDownDirection,
  onOpen,
  onClose,
  loading,
  disabled,
  disabledStyle,
}: any) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (item: any) => {
    setValue(item.value);
    onChangeValue(item.value);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.dropdown, disabled ? disabledStyle : null]}
        onPress={handleToggle}
        disabled={disabled}
      >
        <Text style={placeholderStyle}>
          {value
            ? items.find((i: any) => i.value === value)?.label
            : placeholder}
        </Text>
        <View style={[styles.arrow, arrowIconStyle]} />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.dropdownContainer, dropDownContainerStyle]}>
          {loading ? (
            <ActivityIndicator size="large" color="#486732" />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item: any) => item.value.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 20,
  },
  arrow: {
    width: 10,
    height: 10,
    backgroundColor: '#486732',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fafafa',
    borderColor: '#dadada',
    borderRadius: 20,
    marginTop: 4,
    zIndex: 1,
  },
  item: {
    padding: 10,
  },
});

export default CustomDropDown;
