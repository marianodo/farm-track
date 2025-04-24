import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export function Selector({
  data,
  selectedValues,
  onChange,
}: any) {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [inputFocused, setInputFocused] = useState<Record<string, boolean>>({});

  const handleCategoryPress = (category: string) => {
    const fieldKey = getFieldKeyFromCategory(category);
    const selectedOption = selectedValues[fieldKey]?.value;

    if (selectedOption === 'other' && inputFocused[category]) {
      return;
    }

    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleOptionSelect = (category: string, option: any) => {
    const fieldKey = getFieldKeyFromCategory(category);

    // If selecting 'other', keep the category expanded
    if (option.value === 'other') {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: true
      }));
    } else {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: false
      }));
    }

    onChange({
      ...selectedValues,
      [fieldKey]: {
        value: option.value,
        customValue: option.value === 'other'
          ? selectedValues[fieldKey]?.customValue || ''
          : '',
      },
    });
  };

  const handleCustomValueChange = (category: string, text: string) => {
    const fieldKey = getFieldKeyFromCategory(category);

    onChange({
      ...selectedValues,
      [fieldKey]: {
        ...selectedValues[fieldKey],
        customValue: text,
      },
    });
  };

  const getFieldKeyFromCategory = (category: string): string => {
    return category.replace(/\s+/g, '');
  };

  return (
    <>
      {data.map((categoryData: any, categoryIndex: any) => {
        const category = Object.keys(categoryData)[0];
        const options = categoryData[category];
        const fieldKey = getFieldKeyFromCategory(category);
        const selectedOption = selectedValues[fieldKey]?.value || '';
        const customValue = selectedValues[fieldKey]?.customValue || '';
        const isExpanded = expandedCategories[category];
        const selectedLabel = selectedOption === 'other'
          ? customValue.trim()
          : options.find((opt: any) => opt.value === selectedOption)?.label;

        return (
          <View key={`category-${categoryIndex}`} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {selectedOption && (
                  <Text style={styles.selectedLabel}>
                    {selectedLabel}
                  </Text>
                )}
              </View>
              {isExpanded ? (
                <AntDesign name="caretup" size={16} color="grey" />
              ) : (
                <AntDesign name="caretdown" size={16} color="grey" />
              )}
            </TouchableOpacity>
            {isExpanded && (
              <Animated.View style={styles.animalsList
              }
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
              >
                {options.map((option: any, index: any) => {
                  const isSelected = selectedOption === option.value;
                  return (
                    <TouchableOpacity
                      key={`option-${index}`} // Asegúrate de usar una propiedad única
                      style={[
                        styles.animalButton,
                        isSelected && styles.selectedButton
                      ]}
                      onPress={() => handleOptionSelect(category, option)}
                    >
                      <Text style={[
                        styles.animalText,
                        isSelected && styles.selectedText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {selectedOption === 'other' && (
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={styles.customInput}
                      value={customValue.trimStart()}
                      onChangeText={(text) => handleCustomValueChange(category, text)}
                      placeholder={t('enter') + category?.toLowerCase()}
                      placeholderTextColor="#9CA3AF"
                      selectionColor="#486732"
                    />
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        )
      })}
    </>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    marginVertical: height * 0.01,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    // fontSize: 18,
    // fontWeight: '600',
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
  },
  selectedLabel: {
    fontSize: 14,
    color: '#486732',
    fontFamily: 'Pro-Bold',
    marginTop: 4,
  },
  animalsList: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F9FAFB',
  },
  animalButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedButton: {
    backgroundColor: '#486732',
    borderColor: '#486732',
  },
  animalText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedText: {
    color: '#fff',
  },
  customInputContainer: {
    marginTop: 8,
    width: '92%',
    alignSelf: 'center',
  },
  customInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827',
  },
});