import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { rMS } from '@/styles/responsive';
import { useTranslation } from 'react-i18next';

type InfoStatsModalProps = {
    isVisible: boolean;
    onClose: () => void;
    stats: {
        totalMeasurements: number;
        variablesMeasured: Record<string, number>;
        totalObjectsMeasured: number;
        pensMeasured: Record<string, Record<string, number>>;
    };
};

export default function InfoStatsModal({
    isVisible,
    onClose,
    stats,
}: InfoStatsModalProps) {
    const { t } = useTranslation();
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay} />
            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('reportsView.infoStatsModal.title')}</Text>
                    <IconButton
                        icon="close"
                        iconColor="#486732"
                        size={rMS(24)}
                        style={styles.closeButton}
                        onPress={onClose}
                    />
                </View>

                <ScrollView style={styles.scrollContainer}>
                    {/* Total Mediciones */}
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>{t('reportsView.infoStatsModal.totalMeasurements')}</Text>
                        <Text style={styles.statValue}>{stats.totalMeasurements}</Text>
                    </View>

                    {/* Variables Medidas */}
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>{t('reportsView.infoStatsModal.variablesMeasured')}</Text>
                        {Object.entries(stats.variablesMeasured).map(([variable, count], index) => (
                            <View key={index} style={styles.subStatItem}>
                                <Text style={styles.statValue}>{variable}: {count}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Total de objetos medidos */}
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>{t('reportsView.infoStatsModal.totalObjectsMeasured')}</Text>
                        <Text style={styles.statValue}>{stats.totalObjectsMeasured}</Text>
                    </View>

                    {/* Desglose por Corral */}
                    {Object.entries(stats.pensMeasured).map(([pen, objects], index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statLabel}>{pen}:</Text>
                            {Object.entries(objects).map(([objectType, count], idx) => (
                                <View key={idx} style={styles.subStatItem}>
                                    <Text style={styles.statValue}>{objectType}: {count}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        maxHeight: rMS(550),
        width: rMS(320),
        backgroundColor: '#EBF2ED',
        borderRadius: 10,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: '-50%' },
            { translateY: '-50%' },
        ],
        padding: rMS(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rMS(15),
    },
    title: {
        fontFamily: 'Pro-Bold',
        color: '#292929',
        fontWeight: 'bold',
        fontSize: rMS(18),
        flex: 1,
    },
    closeButton: {
        margin: 0,
        padding: 0,
    },
    scrollContainer: {
        marginBottom: rMS(10),
    },
    statItem: {
        marginBottom: rMS(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(72, 103, 50, 0.2)',
        paddingBottom: rMS(8),
    },
    subStatItem: {
        marginLeft: rMS(10),
        marginBottom: rMS(4),
    },
    statLabel: {
        fontFamily: 'Pro-Bold',
        color: '#486732',
        fontSize: rMS(14),
        marginBottom: rMS(4),
    },
    statValue: {
        fontFamily: 'Pro-Regular',
        color: '#292929',
        fontSize: rMS(14),
    },
});
