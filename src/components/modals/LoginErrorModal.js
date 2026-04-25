import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export default function LoginErrorModal({
  visible,
  onClose,
  styles,
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingTop: 15 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Dados inválidos</Text>
          <Text style={styles.modalMessage}>
            Verifique se está digitando a identificação e a senha corretamente.
            {' '}
            [HEAL-051]
          </Text>
          <TouchableOpacity style={styles.btnModalPrincipal} onPress={onClose}>
            <Text style={styles.btnEntrarText}>Não sei minha senha</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnModalSecundario} onPress={onClose}>
            <Text style={styles.btnModalSecundarioText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
