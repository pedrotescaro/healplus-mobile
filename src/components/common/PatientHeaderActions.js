import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PatientHeaderActions({
  paciente,
  progress,
  isOpen,
  colors,
  styles,
  onToggle,
  onEdit,
  onArchive,
  onClose,
}) {
  const dotsOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const dotsScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });
  const iconsOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const iconsTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={styles.patientHeaderActions}>
      <Animated.View
        pointerEvents={isOpen ? 'none' : 'auto'}
        style={[
          styles.patientMoreButtonLayer,
          {
            opacity: dotsOpacity,
            transform: [{ scale: dotsScale }],
          },
        ]}
      >
        <TouchableOpacity style={styles.patientMoreButton} onPress={() => onToggle(paciente.id)}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          styles.patientInlineIconActions,
          {
            opacity: iconsOpacity,
            transform: [{ translateX: iconsTranslate }],
          },
        ]}
      >
        <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => onEdit(paciente)}>
          <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => onArchive(paciente)}>
          <Ionicons name="archive-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => onClose(paciente.id)}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
