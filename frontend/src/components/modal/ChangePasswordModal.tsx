import { Modal, View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { rMS } from '@/styles/responsive';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import Ionicons from '@expo/vector-icons/Ionicons';

type ChangePasswordModalProps = {
    isVisible: boolean;
    onClose: () => void;
};

export default function ChangePasswordModal({
    isVisible,
    onClose,
}: ChangePasswordModalProps) {
    const { t } = useTranslation();
    const { changePassword, authLoading, onLogout } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = () => {
        const newErrors: {
            currentPassword?: string;
            newPassword?: string;
            confirmPassword?: string;
        } = {};

        if (!currentPassword) {
            newErrors.currentPassword = t('changePassword.errors.currentRequired');
        }

        if (!newPassword) {
            newErrors.newPassword = t('changePassword.errors.newRequired');
        } else if (newPassword.length < 6) {
            newErrors.newPassword = t('changePassword.errors.newLength');
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = t('changePassword.errors.confirmRequired');
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = t('changePassword.errors.notMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        console.log('submit');
        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            console.log('success');
            alert(t('changePassword.success'));
            resetForm();
            onClose();
            onLogout();
        }
    };

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => {
                resetForm();
                onClose();
            }}
        >
            <View style={styles.overlay} />
            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('changePassword.title')}</Text>
                    <IconButton
                        icon="close"
                        iconColor="#486732"
                        size={rMS(24)}
                        style={styles.closeButton}
                        onPress={() => {
                            resetForm();
                            onClose();
                        }}
                    />
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('changePassword.currentPassword')}</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputWithButton}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder={t('changePassword.currentPasswordPlaceholder')}
                                secureTextEntry={!showCurrentPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <Ionicons
                                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#486732"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.currentPassword && (
                            <Text style={styles.errorText}>{errors.currentPassword}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('changePassword.newPassword')}</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputWithButton}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder={t('changePassword.newPasswordPlaceholder')}
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Ionicons
                                    name={showNewPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#486732"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && (
                            <Text style={styles.errorText}>{errors.newPassword}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('changePassword.confirmPassword')}</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputWithButton}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder={t('changePassword.confirmPasswordPlaceholder')}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#486732"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        disabled={authLoading}
                    >
                        {authLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            t('changePassword.submit')
                        )}
                    </Button>
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
        maxHeight: rMS(500),
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
    inputContainer: {
        marginBottom: rMS(16),
    },
    label: {
        fontFamily: 'Pro-Bold',
        color: '#486732',
        fontSize: rMS(14),
        marginBottom: rMS(4),
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: rMS(10),
        fontSize: rMS(14),
        fontFamily: 'Pro-Regular',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
    },
    inputWithButton: {
        flex: 1,
        padding: rMS(10),
        fontSize: rMS(14),
        fontFamily: 'Pro-Regular',
        backgroundColor: 'transparent',
    },
    eyeButton: {
        padding: rMS(10),
    },
    errorText: {
        color: 'red',
        fontSize: rMS(12),
        marginLeft: rMS(4),
        marginTop: rMS(4),
        fontFamily: 'Pro-Regular',
    },
    submitButton: {
        backgroundColor: '#486732',
        marginTop: rMS(16),
        paddingVertical: rMS(6),
    },
});
