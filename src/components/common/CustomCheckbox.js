import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomCheckbox({ label, isChecked, onPress, colors, styles }) {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <Ionicons
        name={isChecked ? 'checkbox' : 'square-outline'}
        size={26}
        color={isChecked ? colors.primary : colors.icon}
      />
      <Text style={styles.checkboxLabelList}>{label}</Text>
    </TouchableOpacity>
  );
}
