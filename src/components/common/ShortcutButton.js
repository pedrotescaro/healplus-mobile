import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShortcutButton({ icon, label, onPress, colors, styles }) {
  return (
    <TouchableOpacity style={styles.patientActionPill} onPress={onPress} activeOpacity={0.88}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={styles.patientActionPillText}>{label}</Text>
    </TouchableOpacity>
  );
}
