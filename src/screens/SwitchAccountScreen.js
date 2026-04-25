import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TempProfilePhotoEditor from '../components/common/TempProfilePhotoEditor';

export default function SwitchAccountScreen({
  styles,
  colors,
  tempName,
  setTempName,
  tempEmail,
  setTempEmail,
  tempPhoto,
  isImagePickerBusy,
  onOpenImagePicker,
  onRemovePhoto,
  onSave,
  onCancel,
}) {
  return (
    <View style={styles.telaWrapper}>
      <Text style={styles.selectionTitle}>Editar informacoes</Text>
      <View style={styles.editContainer}>
        <TempProfilePhotoEditor
          colors={colors}
          styles={styles}
          tempPhoto={tempPhoto}
          tempName={tempName}
          isImagePickerBusy={isImagePickerBusy}
          onOpenPicker={onOpenImagePicker}
          onRemovePhoto={onRemovePhoto}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>NOME COMPLETO</Text>
          <View style={styles.editInputWrapper}>
            <TextInput style={styles.editInput} value={tempName} onChangeText={setTempName} />
            <Ionicons name="person-outline" size={18} color="#3B82F6" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>E-MAIL DE ACESSO</Text>
          <View style={styles.editInputWrapper}>
            <TextInput
              style={styles.editInput}
              value={tempEmail}
              onChangeText={setTempEmail}
              autoCapitalize="none"
            />
            <Ionicons name="mail-outline" size={18} color="#3B82F6" />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnEntrar} onPress={onSave}>
        <Text style={styles.btnEntrarText}>Salvar Alteracoes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnVoltarSimples} onPress={onCancel}>
        <Text style={styles.btnVoltarSimplesText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
