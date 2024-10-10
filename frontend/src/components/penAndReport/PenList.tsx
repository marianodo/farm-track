import { rMS, rMV } from '@/styles/responsive';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Keyboard,
  Image,
} from 'react-native';
import {
  Swipeable,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { Badge, Divider, IconButton } from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
}

interface Variable {
  id: number;
  name: string;
  type_of_objects: any[];
}

interface PenListProps {
  variables: Variable[];
  expandedItems: number[];
  toggleExpand: (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
  rMS: (value: number) => number;
  styles: any;
}

const PenList: React.FC<PenListProps> = ({
  variables,
  expandedItems,
  toggleExpand,
  setExpandedItems,
  rMS,
  styles,
}) => {
  const { t } = useTranslation();
  const deleteButtonAlert = (id: string, name: string) =>
    Alert.alert(
      `${t('penView.deleteAlertTitle')} '${name}'?`,
      t('penView.deleteAlertSubTitle'),
      [
        {
          text: `${t('penView.cancelButtonAlertText')}`,
          style: 'cancel',
        },
        { text: t('penView.deleteButtonAlertText') },
        // onPress: async () => await onDelete(id)
      ]
    );

  const renderRightActions = (progress: any, dragX: any, attribute: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        // onPress={() => router.push(`/attributes/edit/${attribute.id}`)}
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={() => deleteButtonAlert(attribute.id, attribute.name)}
      >
        <IconButton icon="trash-can-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.deleteButton`)}</Text>
      </Pressable>
    </View>
  );

  const ListItem: React.FC<ListItemProps> = ({
    item,
    index,
    isExpanded,
    toggleExpand,
    setExpandedItems,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const animatedHeight = isExpanded
        ? withTiming('auto', {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          })
        : withTiming(0, {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          });
      return {
        marginTop: -20,
        height: animatedHeight,
        backgroundColor: '#f0f0f0',
      };
    }, [isExpanded]);

    return (
      <Swipeable
        key={index}
        enabled={!isExpanded} // Elimina el swipe si está expandido
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        containerStyle={{
          backgroundColor: '#3A5228',
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <TouchableWithoutFeedback
          key={index}
          onPress={
            item.type_of_objects.length > 0
              ? () => {
                  Keyboard.dismiss();
                  toggleExpand(index, setExpandedItems);
                }
              : () => {
                  Keyboard.dismiss();
                }
          }
        >
          <View style={styles.attributeContainer}>
            <Text
              style={{
                paddingBottom: rMS(8),
                fontSize: rMS(17),
                paddingLeft: 6,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
              }}
            >
              {item?.name}
            </Text>
            {item.type_of_objects.length > 0 && isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../assets/images/tabs/object-selected.png')}
                  style={{
                    width: rMS(22),
                    height: rMS(22),
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : item.type_of_objects.length > 0 && !isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../assets/images/tabs/object-unselected.png')}
                  style={{
                    width: rMS(22),
                    height: rMS(22),
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
        {/* Mostrar información cuando se expande */}

        <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
          <Divider
            style={{
              backgroundColor: '#486732',
              height: 1,
            }}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: rMS(10),
              paddingTop: rMS(8),
              paddingBottom: rMS(8),
              gap: rMS(4),
              width: '100%',
            }}
          >
            {item.type_of_objects.map((variable: any, index: number) => {
              return (
                <Badge
                  key={index}
                  style={{
                    paddingHorizontal: rMS(7),
                    height: rMS(24),
                    backgroundColor: '#486732',
                    fontFamily: 'Pro-Regular',
                    fontSize: rMS(12),
                    marginRight: rMS(4), // Add margin to ensure proper spacing
                    marginBottom: rMS(4), // Add margin to ensure proper spacing
                  }}
                >
                  {variable.name}
                </Badge>
              );
            })}
          </View>
        </Animated.View>
      </Swipeable>
    );
  };

  return false ? (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: '90%',
          backgroundColor: '#ebf2ed',
          height: rMV(44),
          borderRadius: rMS(6),
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: rMV(20),
          display: 'flex',
          flexDirection: 'row',
          paddingRight: rMS(12),
        }}
      >
        <IconButton
          icon={'alert-circle-outline'}
          iconColor="#487632"
          size={rMS(20)}
          style={{ margin: 0 }}
        />
        <Text
          style={{
            color: '#487632',
            fontFamily: 'Pro-Regular',
            fontSize: rMS(10),
            flexShrink: 1,
            flexWrap: 'wrap',
            textAlign: 'center',
          }}
        >
          {t('penView.dontPenMessage')}
        </Text>
      </View>
    </View>
  ) : (
    <View style={styles.spacer}>
      <FlatList
        style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
        data={variables}
        keyExtractor={(item, index) => `${item.name}${index}`}
        renderItem={({ item, index }) => {
          const isExpanded = expandedItems.includes(index);
          return (
            <ListItem
              item={item}
              index={index}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              setExpandedItems={setExpandedItems}
            />
          );
        }}
      />
    </View>
  );
};

export default PenList;
