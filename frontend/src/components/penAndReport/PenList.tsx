import { Pen } from '@/store/interface/pen.interface';
import usePenStore from '@/store/penStore';
import { rMS, rMV } from '@/styles/responsive';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import {
  ActivityIndicator,
  Badge,
  Divider,
  IconButton,
} from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import MessageModal from '../modal/MessageModal';
import TwoButtonsModal from '../modal/TwoButtonsModal';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
}

interface Variable {
  id: number;
  name: string;
  type_of_objects: any[];
}

interface PenListProps {
  pens: Pen[] | null;
  expandedItems: number[];
  toggleExpand: (index: number) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
  rMS: (value: number) => number;
  styles: any;
  fieldId: string;
  setSelectedPenDelete: any;
  setShowModal: any;
  setTexts: any;
  typeOfObjects: any;
  variables: any;
}

const PenList: React.FC<PenListProps> = ({
  pens,
  expandedItems,
  setSelectedPenDelete,
  toggleExpand,
  setShowModal,
  setExpandedItems,
  rMS,
  styles,
  fieldId,
  setTexts,
  typeOfObjects,
  variables,
}) => {
  const { pensLoading } = usePenStore((state) => ({
    pensLoading: state.pensLoading,
  }));
  const router = useRouter();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setExpandedItems([]);
      };
    }, [])
  );
  const renderRightActions = (progress: any, dragX: any, pen: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        onPress={() => {
          router.push({
            pathname: `/pen/editPen`,
            params: {
              penId: pen.id,
              penName: pen.name,
              type_of_objects: JSON.stringify(pen.type_of_objects),
              fieldId: pen.fieldId,
            },
          });
        }}
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={() => {
          setSelectedPenDelete({ id: pen.id });
          setTexts({
            title: `${t('penView.deleteAlertTitle')} "${pen.name}"?`,
            subtitle: `${t('penView.deleteAlertSubTitle')}`,
          });
          setShowModal(true);
        }}
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
                  toggleExpand(index);
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
            {item.type_of_objects.map((type_of_object: any, index: number) => {
              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    router.push({
                      pathname: `/pen/editTypeObject`,
                      params: {
                        type_of_object_name: type_of_object.name,
                        type_of_object_id: type_of_object.id,
                        penId: item.id,
                        penName: item.name,
                      },
                    });
                  }}
                >
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
                    {type_of_object.name}
                  </Badge>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Swipeable>
    );
  };

  return !typeOfObjects?.length || !variables?.length ? (
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
          backgroundColor: '#f5ead2',
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
          iconColor="#d9a220"
          size={rMS(20)}
          style={{ margin: 0 }}
        />
        <Text
          style={{
            color: '#d9a220',
            fontFamily: 'Pro-Regular',
            fontSize: rMS(10),
            flexShrink: 1,
            flexWrap: 'wrap',
            textAlign: 'center',
          }}
        >
          {t('penView.dontObjectAndAttributeMessage')}
        </Text>
      </View>
    </View>
  ) : !pens?.length ? (
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
      {pensLoading ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator
            style={{
              marginTop: '0%',
            }}
            animating={true}
            color="#486732"
          />
        </View>
      ) : (
        <FlatList
          style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
          data={pens}
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
      )}
    </View>
  );
};

export default PenList;
