import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { askOtp, updateProfile, verifyOtp } from '@/Api/api'
import { useUserStore } from '@/store/userStore'
import Toast from 'react-native-toast-message'

const Login = () => {
    const router = useRouter()
    const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'profile'
    const [mobileNo, setMobileNo] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0); // in seconds
    const [canResend, setCanResend] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const setUserData = useUserStore(s => s.setUser);


    const handleSendOtp = async () => {
        if (mobileNo.length !== 10) {
            Toast.show({
                type: 'error',
                text1: `Please enter a valid 10-digit mobile number`,
            });
            return
        }

        try {
            setLoading(true);
            const apiRes = await askOtp(mobileNo);

            Toast.show({
                type: 'success',
                text1: "OTP sent successfully",
            });

            setStep('otp');
            setLoading(false);
            setResendTimer(180);
            setCanResend(false);

            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error: any) {
            setLoading(false);
            console.log(error);

            Toast.show({
                type: 'error',
                text1: `${error?.message || "Something went wrong"}`,
            });
        }
    }

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            setCanResend(false);
            setLoading(true);
            await askOtp(mobileNo);

            Alert.alert("OTP Resent!", `OTP sent again to ${mobileNo}`);

            // Restart timer
            setResendTimer(180);
            // Start countdown again
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setLoading(false);

        } catch (error: any) {
            setLoading(false);
            setCanResend(true);

            Alert.alert("Error", error?.message || "Failed to resend OTP");
        }
    };

    const handleVerifyOtp = async () => {

        if (otp.length !== 4) {
            Toast.show({
                type: 'error',
                text1: `Enter valid 4 digit OTP.`,
            });
            return
        }
        try {
            setLoading(true);
            const apiRes = await verifyOtp(mobileNo, otp);

            if (apiRes.verified) {

                Toast.show({
                    type: 'success',
                    text1: "OTP verified successfully",
                });

                setLoading(false);
                setContactLoading(true);
                setUserData({ id: apiRes.userId, name: apiRes.name, token: apiRes.token });
                await AsyncStorage.setItem('token', apiRes.token);
                await AsyncStorage.setItem('userId', apiRes.userId);
                await AsyncStorage.setItem('name', apiRes.name);
                router.replace('/contacts');
            } else {
                setLoading(false);
                setStep('profile');
            }
        } catch (error: any) {
            setLoading(false);
            Alert.alert("!Error", error?.message || "Internal Server Error");
        }
    }

    const handleSubmitProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return
        }

        if (username.includes(" ")) {
            Alert.alert('Error', 'Please enter a username');
            return
        }

        if (!username.trim()) {
            setErrorMessage('Space not allowed in username');
            return
        }
        setLoading(true);

        try {
            setErrorMessage('');
            const apiRes = await updateProfile(mobileNo, name, username.trim());

            setUserData({ id: apiRes.userId, name: apiRes.name, token: apiRes.token });
            await AsyncStorage.setItem('token', apiRes.token);
            await AsyncStorage.setItem('userId', apiRes.userId);
            await AsyncStorage.setItem('name', apiRes.name);
            router.replace('/contacts');
        } catch (error: any) {
            setLoading(false);
            setErrorMessage(error?.message || "Something went wrong")
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {contactLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                    <Text>Loading Contacts...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        {/* Mobile Number Step */}
                        {step === 'mobile' && (
                            <>
                                <Text style={styles.title}>Login</Text>
                                <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Mobile Number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    value={mobileNo}
                                    onChangeText={setMobileNo}
                                />

                                <TouchableOpacity style={[styles.button, loading && styles.disabledResendButton]} onPress={handleSendOtp} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Send OTP"}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* OTP Verification Step */}
                        {step === 'otp' && (
                            <>
                                <Text style={styles.title}>Verify OTP</Text>
                                <Text style={styles.subtitle}>Enter OTP sent to {mobileNo}</Text>

                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="Enter OTP"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                    textAlign="center"
                                />

                                <Pressable style={[styles.button, loading && styles.disabledResendButton]} onPress={handleVerifyOtp} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? "Verifying OTP..." : "Verify OTP"}</Text>
                                </Pressable>
                                <TouchableOpacity
                                    onPress={handleResendOtp}
                                    disabled={!canResend}
                                    style={[
                                        styles.resendButton,
                                        !canResend && styles.disabledResendButton
                                    ]}
                                >
                                    <Text style={[styles.resendText, !canResend && styles.disabledResendText]}>
                                        {canResend ? "Resend OTP" : `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, "0")}`}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep('mobile')}>
                                    <Text style={styles.changeNumber}>Change Number</Text>
                                </TouchableOpacity>
                            </>
                        )}


                        {/* Profile Completion Step */}
                        {step === 'profile' && (
                            <>
                                <Text style={styles.title}>Complete Your Profile</Text>
                                <Text style={styles.subtitle}>Please fill in your details</Text>
                                {errorMessage && <Text style={styles.error} >{errorMessage}</Text>}

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your name"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mobile Number</Text>
                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        value={mobileNo}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Username</Text>
                                    <View style={styles.usernameContainer}>
                                        <Text style={styles.atSymbol}>@</Text>
                                        <TextInput
                                            style={[styles.input, styles.usernameInput]}
                                            placeholder="username"
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={[styles.button, loading && styles.disabledResendButton]} onPress={handleSubmitProfile}>
                                    <Text style={styles.buttonText}>{loading ? "Please Wait..." : "Submit"}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10
    },
    error: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FF000',
        // marginBottom: 0
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff'
    },
    otpInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 20,
        fontSize: 24,
        backgroundColor: '#fff',
        marginBottom: 20
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    changeNumber: {
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999'
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    atSymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        paddingLeft: 15,
        paddingRight: 5
    },
    usernameInput: {
        flex: 1,
        borderWidth: 0,
        paddingLeft: 0
    },
    resendButton: {
        marginTop: 15,
        padding: 10,
        alignItems: "center",
    },

    disabledResendButton: {
        opacity: 0.5,
    },

    resendText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },

    disabledResendText: {
        color: "#999",
    }

})
