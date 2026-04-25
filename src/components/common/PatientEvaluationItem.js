import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PatientEvaluationItem({
  paciente,
  avaliacao,
  index,
  colors,
  styles,
  onEdit,
}) {
  return (
    <View
      style={[
        styles.patientRecordItem,
        index !== paciente.avaliacoes.length - 1 && styles.patientRecordBorder,
      ]}
    >
      <View style={styles.patientRecordHeaderRow}>
        <View style={styles.patientRecordInfoCol}>
          <View style={styles.patientDetailRow}>
            <Ionicons name="eye-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.patientDetailText}>{avaliacao.regiao}</Text>
          </View>
          <View style={styles.patientDetailRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.patientDetailText}>{avaliacao.data}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.patientEvalEditBtn} onPress={() => onEdit(paciente, avaliacao)}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.patientEvalEditText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
