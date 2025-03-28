import { Pen } from '@/store/interface/pen.interface';
import { ReportWithMeasurements } from '@/store/interface/report.interface';
import usePenStore from '@/store/penStore';
import useReportStore from '@/store/reportStore';
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
  Platform,
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
  reportById: any;
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
  reportById,
  onDelete,
  expandedItems,
  toggleExpand,
  setExpandedItems,
  rMS,
  styles,
  getAllPens,
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

  const { onDeleteMeasurement, reportsLoading } = useReportStore((state) => ({
    onDeleteMeasurement: state.onDeleteMeasurement,
    reportsLoading: state.reportsLoading,
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
          // router.push({
          //   pathname: `/pen/editPen`,
          //   params: {
          //     penId: pen.id,
          //     penName: pen.name,
          //     type_of_objects: JSON.stringify(pen.type_of_objects),
          //     fieldId: pen.fieldId,
          //   },
          // });
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
        enabled={false} // Elimina el swipe si está expandido
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        containerStyle={{
          backgroundColor: '#3A5228',
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <Pressable
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
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                paddingBottom: rMS(8),
                fontSize: rMS(17),
                paddingLeft: 6,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
                width: isExpanded ? '64%' : '90%',
              }}
            >
              {item.type_of_object.name} -{' '}
              {item.name ? item.name : item.correlative_id}
            </Text>
            <View
              style={{
                display: 'flex',
                gap: rMS(1),
                flexDirection: 'row',
                paddingBottom: rMS(8),
              }}
            >
              {isExpanded && (
                <>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                    }}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.5 : 1, // Cambia la opacidad cuando se presiona
                      },
                    ]}
                  >
                    <IconButton
                      onPress={() =>
                        onDeleteMeasurement(reportById, item.measurement[0].id)
                      }
                      icon="trash-can-outline"
                      iconColor="#486732"
                      size={rMV(22)}
                      style={{ marginHorizontal: 0, marginRight: rMS(2) }}
                    />
                  </Pressable>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      router.push({
                        pathname: '/measurement/editMeasurement',
                        params: {
                          reportId: reportById,
                          subjectId: item.id,
                          typeOfObjectName: item.type_of_object.name,
                          subjectName: item.name,
                        },
                      });
                    }}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.5 : 1, // Cambia la opacidad cuando se presiona
                      },
                    ]}
                  >
                    <IconButton
                      icon="pencil-outline"
                      iconColor="#486732"
                      size={rMV(22)}
                      style={{ marginHorizontal: 0, marginRight: rMS(8) }}
                    />
                  </Pressable>
                </>
              )}

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
        </Pressable>
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
          {t('reportsView.dontMeasurementOnReport')}
        </Text>
      </View>
    </View>
  ) : (
    <View style={styles.spacer}>
      <FlatList
        style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10), height: "72%" }}
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
        ListFooterComponentStyle={{
          marginBottom: Platform.OS === 'android' ? rMS(25) : rMS(10),
        }}
        ListFooterComponent={<View style={{ height: 0 }} />} // Optional: Add height if needed
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
