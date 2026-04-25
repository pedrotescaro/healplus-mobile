import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import DropdownField from '../common/DropdownField';
import ModalSheet from './ModalSheet';

export default function AgendaAppointmentModal({
  visible,
  onClose,
  styles,
  colors,
  isEditing,
  agendaForm,
  patients,
  onChangeField,
  onSelectPatient,
  openDropdown,
  setOpenDropdown,
  agendaTypeOptions,
  agendaStatusOptions,
  onSubmit,
  onDelete,
}) {
  return (
    <ModalSheet
      visible={visible}
      onRequestClose={onClose}
      styles={styles}
      colors={colors}
      title={isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
      contentStyle={{ maxHeight: '88%' }}
    >
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <Text style={styles.formLabel}>Paciente *</Text>
        <TextInput
          style={[styles.formInput, { marginBottom: 12 }]}
          placeholder="Nome do paciente"
          placeholderTextColor={colors.placeholder}
          value={agendaForm.paciente}
          onChangeText={text => onChangeField('paciente', text)}
        />

        <Text style={[styles.formLabel, { color: colors.primaryText }]}>
          Selecionar paciente cadastrado
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
        >
          {patients.map(patient => (
            <TouchableOpacity
              key={patient.id}
              style={styles.selectPatientPill}
              onPress={() => onSelectPatient(patient)}
            >
              <Text style={styles.selectPatientText}>
                {patient.nome.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Data *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="aaaa-mm-dd"
              placeholderTextColor={colors.placeholder}
              value={agendaForm.date}
              onChangeText={text => onChangeField('date', text)}
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Hora *</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  placeholder="08"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={agendaForm.hora}
                  onChangeText={text =>
                    onChangeField(
                      'hora',
                      text.replace(/[^0-9]/g, '').slice(0, 2)
                    )
                  }
                />
              </View>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  placeholder="00"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={agendaForm.min}
                  onChangeText={text =>
                    onChangeField(
                      'min',
                      text.replace(/[^0-9]/g, '').slice(0, 2)
                    )
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <DropdownField
          label="Tipo de Atendimento"
          value={agendaForm.tipo}
          optionsList={agendaTypeOptions}
          fieldKey="agenda_tipo"
          onSelect={value => onChangeField('tipo', value)}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
          styles={styles}
        />

        <DropdownField
          label="Status"
          value={agendaForm.status}
          optionsList={agendaStatusOptions}
          fieldKey="agenda_status"
          onSelect={value => onChangeField('status', value)}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
          styles={styles}
        />

        <Text style={styles.formLabel}>Observações</Text>
        <TextInput
          style={[
            styles.formInput,
            {
              height: 96,
              textAlignVertical: 'top',
              paddingTop: 12,
              marginBottom: 18,
            },
          ]}
          multiline
          placeholder="Observações do atendimento"
          placeholderTextColor={colors.placeholder}
          value={agendaForm.observacoes}
          onChangeText={text => onChangeField('observacoes', text)}
        />
      </ScrollView>

      <TouchableOpacity style={styles.btnModalPrincipal} onPress={onSubmit}>
        <Text style={styles.btnEntrarText}>
          {isEditing ? 'Salvar Alterações' : 'Salvar Atendimento'}
        </Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity
          style={[styles.btnModalSecundarioDanger, { marginBottom: 8 }]}
          onPress={onDelete}
        >
          <Text style={styles.btnModalSecundarioDangerText}>
            Excluir Atendimento
          </Text>
        </TouchableOpacity>
      )}
    </ModalSheet>
  );
}
