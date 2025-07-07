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
  reports: Report[] | null;
  expandedItems: number[];
  toggleExpand: (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
  rMS: (value: number) => number;
  styles: any;
  setShowModal: any;
  setTexts: any;
  setSelectedReportDelete: any;
  lng: string | null;
  fieldName: string | null;
  pens: any;
}

const ReportList: React.FC<PenListProps> = ({
  reports,
  expandedItems,
  toggleExpand,
  setExpandedItems,
  setShowModal,
  setTexts,
  setSelectedReportDelete,
  rMS,
  styles,
  lng,
  fieldName,
  pens,
}) => {
  const { reportsLoading } = useReportStore((state) => ({
    reportsLoading: state.reportsLoading,
  }));
  const router = useRouter();
  const { t } = useTranslation();

  const renderRightActions = (progress: any, dragX: any, report: any) => {
    const reportName = (report?.name as string)
      ? report.name.charAt(0).toUpperCase() + report.name.slice(1).toLowerCase()
      : `Report ${report.correlative_id} - ${new Date(
        report.created_at
      ).toLocaleDateString("es", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      }`;


    const reportNameFind = (report?.name as string)
      ? report.name.charAt(0).toUpperCase() + report.name.slice(1).toLowerCase()
      : `Report ${report.id} - ${new Date(
        report.created_at
      ).toLocaleDateString("es", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      }`;
    return (
      <View style={styles.rightActions}>
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: `/report/editReport`,
              params: {
                fieldName: fieldName,
                reportId: +report.id,
                correlative_id: +report.correlative_id,
                reportName: reportName,
                reportNameFind: reportNameFind,
                penName: report.name,
                type_of_objects: JSON.stringify(report.type_of_objects),
                fieldId: report.field_id,
              },
            })
          }
        >
          <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
          <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          // onPress={() => deleteButtonAlert(pen.id, pen.name ? pen.name : '')}
          onPress={() => {
            setSelectedReportDelete({ id: report.id });
            setTexts({
              title: `${t('reportsView.deleteAlertTitle')} "${report.name
                ? report.name
                : `${t('reportsView.reportListNameText')} ${report.correlative_id}`
                }"?`,
              subtitle: `${t('reportsView.deleteAlertSubTitle')}`,
            });
            setShowModal(true);
          }}
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
              : `Report ${new Date(
                item.created_at
              ).toLocaleDateString("es", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}`;
            router.push({
              pathname: `/report/[reportId]`,
              params: {
                fieldName: fieldName,
                reportId: +item.id,
                reportCreated: item.created_at,
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
                  ).toLocaleDateString("es", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}`
                : `${t('reportsView.reportListNameText')} ${item.correlative_id
                } - ${new Date(item.created_at).toLocaleDateString(
                  "es",
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }
                )}`}
            </Text>
          </View>
        </TouchableOpacity>
        {/* Mostrar información cuando se expande */}
      </Swipeable>
    );
  };

  // Mostrar mensaje si no hay corrales
  if (!pens?.length) {
    return (
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
            {t('reportsView.dontPenMessage')}
          </Text>
        </View>
      </View>
    );
  }

  // Mostrar indicador de carga
  if (reportsLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '30%',
        }}
      >
        <ActivityIndicator
          animating={true}
          color="#486732"
          size="large"
        />
        <Text
          style={{
            color: '#486732',
            fontFamily: 'Pro-Regular',
            fontSize: rMS(14),
            marginTop: rMS(10),
            textAlign: 'center',
          }}
        >
          {t('reportsView.loadingReports')}
        </Text>
      </View>
    );
  }

  // Mostrar mensaje si no hay reportes
  if (!reports || reports.length === 0) {
    return (
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
            {t('reportsView.dontReportMessage')}
          </Text>
        </View>
      </View>
    );
  }

  // Mostrar lista de reportes
  return (
    <View style={styles.spacer}>
      <FlatList
        ListFooterComponentStyle={{
          marginBottom: Platform.OS === 'android' ? rMS(58) : rMS(50),
        }}
        ListFooterComponent={<View></View>}
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
    </View>
  );
};

export default ReportList;
