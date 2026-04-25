import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  rightElement,
  danger = false,
  disabled = false,
  showChevron = false,
  colors,
  styles,
}) {
  const RowComponent = onPress ? TouchableOpacity : View;
  const rowProps = onPress ? { onPress, activeOpacity: 0.88 } : {};

  return (
    <RowComponent
      style={[
        styles.profileMenuItem,
        danger && styles.profileMenuItemDanger,
        disabled && styles.settingsRowDisabled,
      ]}
      {...rowProps}
    >
      <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      {rightElement ||
        (showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={danger ? '#EF4444' : colors.border}
          />
        ) : null)}
    </RowComponent>
  );
}
