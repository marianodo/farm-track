import {
  Report,
  CreateReport,
  ReportWithMeasurements,
} from '@/store/interface/report.interface';
import useReportStore from '@/store/reportStore';
import { rMS, rMV } from '@/styles/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
  TouchableOpacity,
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
  reports: Report[] | null;
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
  lng: string | null;
  fieldName: string | null;
}

const ReportList: React.FC<PenListProps> = ({
  reports,
  onDelete,
  expandedItems,
  toggleExpand,
  setExpandedItems,
  rMS,
  styles,
  lng,
  fieldId,
  fieldName,
}) => {
  const { reportsLoading } = useReportStore((state) => ({
    reportsLoading: state.reportsLoading,
  }));
  const router = useRouter();
  const { t } = useTranslation();
  const deleteButtonAlert = (id: number, name: string) =>
    Alert.alert(
      `${t('penView.deleteAlertTitle')} '${name ? name : id}'?`,
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

  const renderRightActions = (progress: any, dragX: any, pen: any) => {
    const reportName = (pen?.name as string)
      ? pen.name.charAt(0).toUpperCase() + pen.name.slice(1).toLowerCase()
      : `Reporte: ${new Date(pen.created_at).toLocaleDateString(`${lng}`, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`;
    return (
      <View style={styles.rightActions}>
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: `/report/editReport`,
              params: {
                fieldName: fieldName,
                reportId: +pen.id,
                reportName: reportName,
                penName: pen.name,
                type_of_objects: JSON.stringify(pen.type_of_objects),
                fieldId: pen.field_id,
              },
            })
          }
        >
          <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
          <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteButtonAlert(pen.id, pen.name ? pen.name : '')}
        >
          <IconButton
            icon="trash-can-outline"
            iconColor="#fff"
            size={rMS(24)}
          />
          <Text style={styles.actionText}>{t(`fieldView.deleteButton`)}</Text>
        </Pressable>
      </View>
    );
  };

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
        // enabled={!isExpanded} // Elimina el swipe si está expandido
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        containerStyle={{
          height: rMV(60),
          backgroundColor: '#3A5228',
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <TouchableOpacity
          key={index}
          activeOpacity={0.7}
          onPress={() => {
            const reportName = (item?.name as string)
              ? item.name.charAt(0).toUpperCase() +
                item.name.slice(1).toLowerCase()
              : `Reporte: ${new Date(item.created_at).toLocaleDateString(
                  `${lng}`,
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }
                )}`;
            router.push({
              pathname: `/report/[reportId]`,
              params: {
                fieldName: fieldName,
                reportId: +item.id,
                reportName: reportName,
                penName: item.name,
                type_of_objects: JSON.stringify(item.type_of_objects),
                fieldId: item.field_id,
              },
            });
          }}
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
              {(item?.name as string)
                ? `${item.name.charAt(0).toUpperCase()}${item.name
                    .slice(1)
                    .toLowerCase()} - ${new Date(
                    item.created_at
                  ).toLocaleDateString(`${lng}`, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}`
                : `${t('reportsView.reportListNameText')} ${
                    item.id
                  } - ${new Date(item.created_at).toLocaleDateString(`${lng}`, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}`}
            </Text>
          </View>
        </TouchableOpacity>
        {/* Mostrar información cuando se expande */}
      </Swipeable>
    );
  };

  return !reports?.length ? (
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
      {reportsLoading ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          data={reports}
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

export default ReportList;
