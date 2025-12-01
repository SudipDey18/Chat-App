import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const BaseToastComponent = ({ 
  text1, 
  iconName, 
  color 
}: { 
  text1?: string, 
  iconName: keyof typeof Ionicons.glyphMap, 
  color: string 
}) => (
  <View style={styles.container}>
    <Ionicons name={iconName} size={18} color={color} style={styles.icon} />
    <Text style={styles.text} numberOfLines={1}>{text1}</Text>
  </View>
);

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <BaseToastComponent 
      text1={text1} 
      iconName="checkmark-circle" 
      color="#00C851"
    />
  ),

  error: ({ text1 }) => (
    <BaseToastComponent 
      text1={text1} 
      iconName="alert-circle" 
      color="#ff4444"
    />
  ),

  info: ({ text1 }) => (
    <BaseToastComponent 
      text1={text1} 
      iconName="information-circle" 
      color="#33b5e5"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    width: '85%', 
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    flex: 1,
  },
});