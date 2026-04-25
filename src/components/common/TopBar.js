import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ title, backTo = 'Home', colors, styles, onBack }) {
  return (
    <View style={styles.relatorioHeaderRow}>
      <TouchableOpacity onPress={() => onBack(backTo)} style={{ padding: 5 }}>
        <Ionicons name="arrow-back" size={26} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.relatorioHeaderTitle}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}
