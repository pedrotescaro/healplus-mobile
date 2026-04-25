import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckItem({ label, value, onPress, colors, styles }) {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <Ionicons
        name={value ? 'checkbox' : 'square-outline'}
        size={24}
        color={value ? colors.primary : colors.border}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
