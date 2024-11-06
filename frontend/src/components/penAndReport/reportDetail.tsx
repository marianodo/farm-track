import { Pen } from '@/store/interface/pen.interface';
import { ReportWithMeasurements } from '@/store/interface/report.interface';
import usePenStore from '@/store/penStore';
import { rMS, rMV } from '@/styles/responsive';
import { useRouter } from 'expo-router';
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
  reports: any;
  reportsLoading: boolean;
  expandedItems: number[];
  toggleExpand: (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
  rMS: (value: number) => number;
  styles: any;
  getAllPens: (fieldId: string) => void;
  onDelete: (id: number, fieldId: string) => void;
  fieldId: string;
}

const ReportDetail: React.FC<PenListProps> = ({
  reports,
  onDelete,
  expandedItems,
  toggleExpand,
  setExpandedItems,
  rMS,
  styles,
  getAllPens,
  reportsLoading,
  fieldId,
}) => {
  const formatTime = (dateString: any) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const { pensLoading } = usePenStore((state) => ({
    pensLoading: state.pensLoading,
  }));
  const router = useRouter();
  const { t } = useTranslation();
  const deleteButtonAlert = (id: number, name: string) =>
    Alert.alert(
      `${t('penView.deleteAlertTitle')} '${name}'?`,
      t('penView.deleteAlertSubTitle'),
      [
        {
          text: `${t('penView.cancelButtonAlertText')}`,
          style: 'cancel',
        },
        {
          text: t('penView.deleteButtonAlertText'),
          onPress: async () => onDelete(id, fieldId),
        },
      ]
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
        onPress={() => deleteButtonAlert(pen.id, pen.name)}
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
            // item.type_of_objects.length > 0
            //   ? () => {
            //       Keyboard.dismiss();
            //       toggleExpand(index, setExpandedItems);
            //     }
            //   : () => {
            //       Keyboard.dismiss();
            //     }
            () => toggleExpand(index, setExpandedItems)
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
              {item.type_of_object.name} - {item.name ? item.name : item.id}
            </Text>
            <View style={{ paddingBottom: rMS(8) }}>
              <Image
                source={
                  isExpanded
                    ? require('../../../assets/images/reportDetailOn.png')
                    : require('../../../assets/images/reportDetailOf.png')
                }
                style={{
                  width: rMS(22),
                  height: rMS(22),
                  alignSelf: 'center',
                }}
                resizeMode="contain"
              />
            </View>
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
              flexDirection: 'column',
              flexWrap: 'wrap',
              paddingHorizontal: rMS(10),
              paddingTop: rMS(8),
              paddingBottom: rMS(8),
              gap: rMS(26),
              width: '100%',
            }}
          >
            {item.measurement.map((measurement: any) => (
              <View key={measurement.id} style={stylesDetail.infoContainer}>
                <Text style={stylesDetail.infoTextLeft}>
                  {`${measurement.pen_variable_type_of_object.variable.name}: ${measurement.value}`}
                </Text>
                <Text style={stylesDetail.infoTextRight}>
                  {formatTime(measurement.updated_at)}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </Swipeable>
    );
  };

  return !reports ? (
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
        data={reports.subjects}
        keyExtractor={(item, index) => `${item.name}${item.id}${index}`}
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

export default ReportDetail;

const stylesDetail = StyleSheet.create({
  infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
  },
  infoTextLeft: {
    color: '#292929',
    fontFamily: 'Pro-Regular',
    fontSize: rMS(14),
  },
  infoTextRight: {
    color: '#96A59A',
    fontFamily: 'Pro-Regular',
    fontSize: rMS(14),
  },
});
