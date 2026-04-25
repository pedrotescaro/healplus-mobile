import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ModalSheet from './ModalSheet';

export default function PatientFormModal({
  visible,
  onClose,
  styles,
  colors,
  isEditing,
  name,
  birthDate,
  phone,
  email,
  onChangeName,
  onChangeBirthDate,
  onChangePhone,
  onChangeEmail,
  onSubmit,
}) {
  return (
    <ModalSheet
      visible={visible}
      onRequestClose={onClose}
      styles={styles}
      colors={colors}
      title={isEditing ? 'Editar Dados Pessoais' : 'Cadastrar Paciente'}
    >
      <View style={{ width: '100%', marginBottom: 20 }}>
        <Text style={styles.formLabel}>Nome Completo *</Text>
        <TextInput
          style={[styles.formInput, { marginBottom: 10 }]}
          placeholder="Ex: João da Silva"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={onChangeName}
        />

        <Text style={styles.formLabel}>Data de Nascimento</Text>
        <View style={[styles.inputWithIcon, { marginBottom: 10 }]}>
          <TextInput
            style={styles.formInputFlex}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={colors.placeholder}
            value={birthDate}
            onChangeText={onChangeBirthDate}
          />
          <Ionicons name="calendar-outline" size={16} color={colors.border} />
        </View>

        <Text style={styles.formLabel}>Telefone</Text>
        <TextInput
          style={[styles.formInput, { marginBottom: 10 }]}
          placeholder="(00) 00000-0000"
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={onChangePhone}
        />

        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          style={styles.formInput}
          placeholder="email@exemplo.com"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          value={email}
          onChangeText={onChangeEmail}
        />
      </View>

      <TouchableOpacity style={styles.btnModalPrincipal} onPress={onSubmit}>
        <Text style={styles.btnEntrarText}>
          {isEditing ? 'Salvar Alterações' : 'Salvar Paciente'}
        </Text>
      </TouchableOpacity>
    </ModalSheet>
  );
}
