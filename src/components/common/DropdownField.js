import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DropdownField({
  label,
  value,
  optionsList,
  fieldKey,
  onSelect,
  openDropdown,
  setOpenDropdown,
  colors,
  styles,
  placeholder = 'Selecione...',
}) {
  return (
    <View style={{ marginBottom: 12, zIndex: openDropdown === fieldKey ? 99 : 1 }}>
      {!!label && <Text style={styles.formLabel}>{label}</Text>}
      <TouchableOpacity
        style={styles.inputWithIcon}
        onPress={() => setOpenDropdown(openDropdown === fieldKey ? null : fieldKey)}
      >
        <Text style={[styles.formInputFlex, !value && { color: colors.placeholder }]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={openDropdown === fieldKey ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.border}
        />
      </TouchableOpacity>
      {openDropdown === fieldKey && (
        <View style={styles.dropdownContainer}>
          {optionsList.map(option => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option);
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
