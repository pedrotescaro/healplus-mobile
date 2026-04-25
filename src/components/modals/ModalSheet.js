import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalSheet({
  visible,
  onRequestClose,
  styles,
  colors,
  title,
  children,
  contentStyle,
  showCloseButton = true,
  closeDisabled = false,
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingTop: 15 }, contentStyle]}>
          <View style={styles.modalHandle} />
          {!!title && (
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{title}</Text>
              {showCloseButton ? (
                <TouchableOpacity
                  onPress={onRequestClose}
                  disabled={closeDisabled}
                >
                  <Ionicons
                    name="close-circle"
                    size={26}
                    color={colors.border}
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 26 }} />
              )}
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}
