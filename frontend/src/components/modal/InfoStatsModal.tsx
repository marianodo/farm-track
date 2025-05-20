import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { rMS } from '@/styles/responsive';

type InfoStatsModalProps = {
    isVisible: boolean;
    onClose: () => void;
    stats: {
        totalMeasurements: number;
        totalPensMeasured: number;
        pensMeasured: string[];
        totalVariablesMeasured: number;
        variablesMeasured: string[];
    };
};

export default function InfoStatsModal({
    isVisible,
    onClose,
    stats,
}: InfoStatsModalProps) {
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
                    <Text style={styles.title}>Resumen de la evaluación</Text>
                    <IconButton
                        icon="close"
                        iconColor="#486732"
                        size={rMS(24)}
                        style={styles.closeButton}
                        onPress={onClose}
                    />
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Mediciones:</Text>
                        <Text style={styles.statValue}>{stats.totalMeasurements}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Corrales Medidos:</Text>
                        <Text style={styles.statValue}>{stats.totalPensMeasured}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Corrales Medidos:</Text>
                        <Text style={styles.statValue}>{stats.pensMeasured.join(', ')}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Variables Medidas:</Text>
                        <Text style={styles.statValue}>{stats.totalVariablesMeasured}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Variables medidas:</Text>
                        <Text style={styles.statValue}>{stats.variablesMeasured.join(', ')}</Text>
                    </View>
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
        maxHeight: '70%',
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
