import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import CheckItem from '../components/common/CheckItem';
import DropdownField from '../components/common/DropdownField';
import HeaderDashboard from '../components/common/HeaderDashboard';
import {
  COMORBIDADES_CONFIG,
  FORM_OPTIONS,
  MEDICAMENTOS_CONFIG,
} from '../constants/appConstants';

const PAIN_LABELS = [
  'Sem Dor',
  'Mínima',
  'Leve',
  'Incômoda',
  'Moderada',
  'Desconforto',
  'Intensa',
  'Muito Intensa',
  'Forte',
  'Insuportável',
  'Máxima',
];

function renderMedicationFields({ base, form, updateField, colors, styles }) {
  if (!form[base]) return null;

  return (
    <>
      <TextInput
        style={[styles.formInput, { marginBottom: 10 }]}
        placeholder="Nome"
        placeholderTextColor={colors.placeholder}
        value={form[`${base}_nome`]}
        onChangeText={text => updateField(`${base}_nome`, text)}
      />
      <TextInput
        style={styles.formInput}
        placeholder="Dose"
        placeholderTextColor={colors.placeholder}
        value={form[`${base}_dose`]}
        onChangeText={text => updateField(`${base}_dose`, text)}
      />
    </>
  );
}

export default function EvaluationScreen({
  styles,
  colors,
  form,
  updateField,
  toggleBool,
  handleTissuePercentageChange,
  expandedSection,
  toggleSection,
  pacientesAtivos,
  onSelectExistingPatient,
  showImagePickerModal,
  setShowImagePickerModal,
  isImagePickerBusy,
  onOpenImagePicker,
  onTakeWoundPhoto,
  onChooseWoundPhoto,
  getPainColor,
  openDropdown,
  setOpenDropdown,
  onSave,
  avaliacaoPageTitle,
  avaliacaoSaveButtonLabel,
  headerProps,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <HeaderDashboard {...headerProps} />

      <Modal
        animationType="slide"
        transparent
        visible={showImagePickerModal}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: 15 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Adicionar Imagem</Text>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)} disabled={isImagePickerBusy}>
                <Ionicons name="close-circle" size={26} color={colors.border} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 25, textAlign: 'center' }}>
              Escolha como deseja adicionar a foto da ferida
            </Text>

            <TouchableOpacity
              style={[styles.imagePickerOption, isImagePickerBusy && { opacity: 0.7 }]}
              onPress={onTakeWoundPhoto}
              disabled={isImagePickerBusy}
            >
              <View style={[styles.imagePickerIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="camera" size={28} color="#3B82F6" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Tirar Foto</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Abrir a câmera do dispositivo
                </Text>
              </View>
              {isImagePickerBusy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imagePickerOption, isImagePickerBusy && { opacity: 0.7 }]}
              onPress={onChooseWoundPhoto}
              disabled={isImagePickerBusy}
            >
              <View style={[styles.imagePickerIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="images" size={28} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Escolher da Galeria</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Selecionar um arquivo existente
                </Text>
              </View>
              {isImagePickerBusy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitleCentralized}>{avaliacaoPageTitle}</Text>
        <Text style={styles.pageSubtitleCentralized}>
          Anamnese inspirada no arquivo enviado, adaptada para Expo com persistência local
        </Text>

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-0' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-0')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="person-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>Dados Pessoais</Text>
          </View>
          <Ionicons name={expandedSection === 'item-0' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-0' ? (
          <View style={styles.accordionContent}>
            <Text style={[styles.formLabel, { color: '#3B82F6' }]}>Vincular Paciente Existente</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {pacientesAtivos.map(paciente => (
                <TouchableOpacity key={paciente.id} style={styles.selectPatientPill} onPress={() => onSelectExistingPatient(paciente)}>
                  <Text style={styles.selectPatientText}>{paciente.nome.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Nome Completo</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.nome_cliente}
                  onChangeText={text => updateField('nome_cliente', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Data de Nascimento</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.data_nascimento}
                  onChangeText={text => updateField('data_nascimento', text)}
                  placeholder="aaaa-mm-dd"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Telefone</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.telefone}
                  onChangeText={text => updateField('telefone', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.email}
                  onChangeText={text => updateField('email', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Profissão</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.profissao}
                  onChangeText={text => updateField('profissao', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <DropdownField
                  label="Estado Civil"
                  value={form.estado_civil}
                  optionsList={FORM_OPTIONS.estadoCivil}
                  fieldKey="estado_civil"
                  onSelect={value => updateField('estado_civil', value)}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  colors={colors}
                  styles={styles}
                />
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-1' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-1')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="images-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>T - Tecido</Text>
          </View>
          <Ionicons name={expandedSection === 'item-1' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-1' ? (
          <View style={styles.accordionContent}>
            <Text style={[styles.formLabel, { fontWeight: '800', fontSize: 14, marginBottom: 10 }]}>
              Imagem da Ferida
            </Text>
            <TouchableOpacity
              style={[styles.imagePickerArea, isImagePickerBusy && { opacity: 0.7 }]}
              onPress={onOpenImagePicker}
              activeOpacity={0.7}
              disabled={isImagePickerBusy}
            >
              {form.woundImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: form.woundImageUri }} style={styles.imagePreview} resizeMode="cover" />
                  <View style={styles.imageOverlayBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600', marginLeft: 5 }}>
                      Foto adicionada
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.imageChangeBtn} onPress={onOpenImagePicker} disabled={isImagePickerBusy}>
                    <Ionicons name="camera-reverse" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                      Trocar foto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageRemoveBtn}
                    onPress={() => !isImagePickerBusy && updateField('woundImageUri', '')}
                    disabled={isImagePickerBusy}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <View style={styles.imagePickerIconCircle}>
                    <Ionicons name="camera" size={32} color="#3B82F6" />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 12 }}>
                    Adicionar foto da ferida
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}>
                    Toque para tirar foto ou escolher da galeria
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 15 }} />
            <Text style={styles.formLabel}>Dimensões e Características Gerais</Text>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  value={form.ferida_largura}
                  onChangeText={text => updateField('ferida_largura', text)}
                  placeholder="Largura (cm)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  value={form.ferida_comprimento}
                  onChangeText={text => updateField('ferida_comprimento', text)}
                  placeholder="Comprimento (cm)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <TextInput
              style={[styles.formInput, { marginBottom: 10 }]}
              value={form.ferida_profundidade}
              onChangeText={text => updateField('ferida_profundidade', text)}
              placeholder="Profundidade (cm)"
              placeholderTextColor={colors.placeholder}
            />

            <DropdownField
              label="Localização"
              value={form.localizacao_ferida}
              optionsList={FORM_OPTIONS.localizacaoFerida}
              fieldKey="localizacao_ferida"
              onSelect={value => updateField('localizacao_ferida', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            <TextInput
              style={[styles.formInput, { marginBottom: 10 }]}
              value={form.tempo_evolucao}
              onChangeText={text => updateField('tempo_evolucao', text)}
              placeholder="Tempo de Evolução"
              placeholderTextColor={colors.placeholder}
            />

            <DropdownField
              label="Etiologia"
              value={form.etiologia_ferida}
              optionsList={FORM_OPTIONS.etiologiaFerida}
              fieldKey="etiologia_ferida"
              onSelect={value => updateField('etiologia_ferida', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            {form.etiologia_ferida === 'Outra' ? (
              <TextInput
                style={[styles.formInput, { marginBottom: 10 }]}
                value={form.etiologia_outra}
                onChangeText={text => updateField('etiologia_outra', text)}
                placeholder="Especifique a etiologia"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}

            <Text style={styles.formLabel}>Avaliação do Leito da Ferida (soma máx. 100%)</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={form.percentual_granulacao_leito}
                  onChangeText={text => handleTissuePercentageChange('percentual_granulacao_leito', text)}
                  placeholder="Granulação (%)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={form.percentual_epitelizacao_leito}
                  onChangeText={text => handleTissuePercentageChange('percentual_epitelizacao_leito', text)}
                  placeholder="Epitelização (%)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={form.percentual_esfacelo_leito}
                  onChangeText={text => handleTissuePercentageChange('percentual_esfacelo_leito', text)}
                  placeholder="Esfacelo (%)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={form.percentual_necrose_seca_leito}
                  onChangeText={text => handleTissuePercentageChange('percentual_necrose_seca_leito', text)}
                  placeholder="Necrose seca (%)"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.tissueBarContainer}>
              {(parseInt(form.percentual_granulacao_leito, 10) || 0) > 0 ? (
                <View
                  style={[
                    styles.tissueBarSegment,
                    { flex: parseInt(form.percentual_granulacao_leito, 10), backgroundColor: '#EF4444' },
                  ]}
                />
              ) : null}
              {(parseInt(form.percentual_epitelizacao_leito, 10) || 0) > 0 ? (
                <View
                  style={[
                    styles.tissueBarSegment,
                    { flex: parseInt(form.percentual_epitelizacao_leito, 10), backgroundColor: '#EC4899' },
                  ]}
                />
              ) : null}
              {(parseInt(form.percentual_esfacelo_leito, 10) || 0) > 0 ? (
                <View
                  style={[
                    styles.tissueBarSegment,
                    { flex: parseInt(form.percentual_esfacelo_leito, 10), backgroundColor: '#F59E0B' },
                  ]}
                />
              ) : null}
              {(parseInt(form.percentual_necrose_seca_leito, 10) || 0) > 0 ? (
                <View
                  style={[
                    styles.tissueBarSegment,
                    { flex: parseInt(form.percentual_necrose_seca_leito, 10), backgroundColor: '#111827' },
                  ]}
                />
              ) : null}
              {100 -
                (parseInt(form.percentual_granulacao_leito, 10) || 0) -
                (parseInt(form.percentual_epitelizacao_leito, 10) || 0) -
                (parseInt(form.percentual_esfacelo_leito, 10) || 0) -
                (parseInt(form.percentual_necrose_seca_leito, 10) || 0) >
              0 ? (
                <View
                  style={[
                    styles.tissueBarSegment,
                    {
                      flex:
                        100 -
                        ((parseInt(form.percentual_granulacao_leito, 10) || 0) +
                          (parseInt(form.percentual_epitelizacao_leito, 10) || 0) +
                          (parseInt(form.percentual_esfacelo_leito, 10) || 0) +
                          (parseInt(form.percentual_necrose_seca_leito, 10) || 0)),
                      backgroundColor: colors.borderLight,
                    },
                  ]}
                />
              ) : null}
            </View>

            <View style={styles.tissueLegendRow}>
              <View style={styles.tissueLegendItem}>
                <View style={[styles.tissueLegendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.tissueLegendText}>Granulação</Text>
              </View>
              <View style={styles.tissueLegendItem}>
                <View style={[styles.tissueLegendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.tissueLegendText}>Epitelização</Text>
              </View>
              <View style={styles.tissueLegendItem}>
                <View style={[styles.tissueLegendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.tissueLegendText}>Esfacelo</Text>
              </View>
              <View style={styles.tissueLegendItem}>
                <View style={[styles.tissueLegendDot, { backgroundColor: '#111827' }]} />
                <Text style={styles.tissueLegendText}>Necrose seca</Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-2' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-2')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="medkit-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>I - Infecção e Inflamação</Text>
          </View>
          <Ionicons name={expandedSection === 'item-2' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-2' ? (
          <View style={styles.accordionContent}>
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={styles.formLabel}>Intensidade da Dor</Text>
                <Text style={{ fontWeight: '800', color: getPainColor(parseInt(form.dor_escala || 0, 10)) }}>
                  {form.dor_escala || '0'} - {PAIN_LABELS[parseInt(form.dor_escala || 0, 10)]}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 8 }}>
                <Text style={{ fontSize: 28 }}>:D</Text>
                <Text style={{ fontSize: 28 }}>:)</Text>
                <Text style={{ fontSize: 28 }}>:|</Text>
                <Text style={{ fontSize: 28 }}>:(</Text>
                <Text style={{ fontSize: 28 }}>:o</Text>
              </View>

              <View style={styles.painScaleBar}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => {
                  const isSelected = String(form.dor_escala) === String(value);
                  const color = getPainColor(value);
                  return (
                    <TouchableOpacity
                      key={value}
                      activeOpacity={0.7}
                      onPress={() => updateField('dor_escala', String(value))}
                      style={[
                        styles.painScaleSegment,
                        {
                          backgroundColor: isSelected ? color : colors.inputBg,
                          borderRightWidth: value === 10 ? 0 : 1,
                          borderRightColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.painScaleText, isSelected && { color: '#FFF' }]}>{value}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top', marginBottom: 12 }]}
              multiline
              value={form.dor_fatores}
              onChangeText={text => updateField('dor_fatores', text)}
              placeholder="Fatores que aliviam/pioram a dor"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.formLabel}>Sinais de Inflamação</Text>
            <CheckItem label="Rubor" value={form.inflamacao_rubor} onPress={() => toggleBool('inflamacao_rubor')} colors={colors} styles={styles} />
            <CheckItem label="Calor" value={form.inflamacao_calor} onPress={() => toggleBool('inflamacao_calor')} colors={colors} styles={styles} />
            <CheckItem label="Edema" value={form.inflamacao_edema} onPress={() => toggleBool('inflamacao_edema')} colors={colors} styles={styles} />
            <CheckItem label="Dor Local" value={form.inflamacao_dor_local} onPress={() => toggleBool('inflamacao_dor_local')} colors={colors} styles={styles} />
            <CheckItem label="Perda de Função" value={form.inflamacao_perda_funcao} onPress={() => toggleBool('inflamacao_perda_funcao')} colors={colors} styles={styles} />

            <Text style={[styles.formLabel, { marginTop: 12 }]}>Sinais de Infecção Local</Text>
            <CheckItem label="Eritema Perilesional" value={form.infeccao_eritema_perilesional} onPress={() => toggleBool('infeccao_eritema_perilesional')} colors={colors} styles={styles} />
            <CheckItem label="Calor Local" value={form.infeccao_calor_local} onPress={() => toggleBool('infeccao_calor_local')} colors={colors} styles={styles} />
            <CheckItem label="Edema" value={form.infeccao_edema} onPress={() => toggleBool('infeccao_edema')} colors={colors} styles={styles} />
            <CheckItem label="Dor Local" value={form.infeccao_dor_local} onPress={() => toggleBool('infeccao_dor_local')} colors={colors} styles={styles} />
            <CheckItem label="Exsudato Purulento" value={form.infeccao_exsudato} onPress={() => toggleBool('infeccao_exsudato')} colors={colors} styles={styles} />
            <CheckItem label="Odor Fétido" value={form.infeccao_odor} onPress={() => toggleBool('infeccao_odor')} colors={colors} styles={styles} />
            <CheckItem label="Retardo na Cicatrização" value={form.infeccao_retardo_cicatrizacao} onPress={() => toggleBool('infeccao_retardo_cicatrizacao')} colors={colors} styles={styles} />
            <CheckItem label="Cultura da Ferida Realizada?" value={form.cultura_realizada} onPress={() => toggleBool('cultura_realizada')} colors={colors} styles={styles} />

            {form.cultura_realizada ? (
              <TextInput
                style={styles.formInput}
                value={form.resultado_cultura}
                onChangeText={text => updateField('resultado_cultura', text)}
                placeholder="Resultado da cultura"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-3' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-3')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="water-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>M - Umidade (Exsudato)</Text>
          </View>
          <Ionicons name={expandedSection === 'item-3' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-3' ? (
          <View style={styles.accordionContent}>
            <DropdownField
              label="Quantidade"
              value={form.quantidade_exsudato}
              optionsList={FORM_OPTIONS.quantidadeExsudato}
              fieldKey="quantidade_exsudato"
              onSelect={value => updateField('quantidade_exsudato', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
            <DropdownField
              label="Tipo"
              value={form.tipo_exsudato}
              optionsList={FORM_OPTIONS.tipoExsudato}
              fieldKey="tipo_exsudato"
              onSelect={value => updateField('tipo_exsudato', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
            <DropdownField
              label="Consistência"
              value={form.consistencia_exsudato}
              optionsList={FORM_OPTIONS.consistenciaExsudato}
              fieldKey="consistencia_exsudato"
              onSelect={value => updateField('consistencia_exsudato', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-4' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-4')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="scan-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>E - Bordas (Edge)</Text>
          </View>
          <Ionicons name={expandedSection === 'item-4' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-4' ? (
          <View style={styles.accordionContent}>
            <DropdownField
              label="Características das Bordas"
              value={form.bordas_caracteristicas}
              optionsList={FORM_OPTIONS.bordasCaracteristicas}
              fieldKey="bordas_caracteristicas"
              onSelect={value => updateField('bordas_caracteristicas', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
            <DropdownField
              label="Fixação das Bordas"
              value={form.fixacao_bordas}
              optionsList={FORM_OPTIONS.fixacaoBordas}
              fieldKey="fixacao_bordas"
              onSelect={value => updateField('fixacao_bordas', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
            <DropdownField
              label="Velocidade de Cicatrização"
              value={form.velocidade_cicatrizacao}
              optionsList={FORM_OPTIONS.velocidadeCicatrizacao}
              fieldKey="velocidade_cicatrizacao"
              onSelect={value => updateField('velocidade_cicatrizacao', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            <CheckItem label="Presença de Túneis ou Cavidade?" value={form.tunel_cavidade} onPress={() => toggleBool('tunel_cavidade')} colors={colors} styles={styles} />
            {form.tunel_cavidade ? (
              <TextInput
                style={[styles.formInput, { marginBottom: 10 }]}
                value={form.localizacao_tunel_cavidade}
                onChangeText={text => updateField('localizacao_tunel_cavidade', text)}
                placeholder="Localização do túnel/cavidade"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}

            <DropdownField
              label="Umidade da Pele Perilesional"
              value={form.pele_perilesional_umidade}
              optionsList={FORM_OPTIONS.pelePerilesionalUmidade}
              fieldKey="pele_perilesional_umidade"
              onSelect={value => updateField('pele_perilesional_umidade', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            <TextInput
              style={[styles.formInput, { marginBottom: 10 }]}
              value={form.pele_perilesional_extensao}
              onChangeText={text => updateField('pele_perilesional_extensao', text)}
              placeholder="Extensão da alteração"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.formLabel}>Condição da Pele</Text>
            <CheckItem label="Íntegra" value={form.pele_perilesional_integra} onPress={() => toggleBool('pele_perilesional_integra')} colors={colors} styles={styles} />
            <CheckItem label="Eritematosa" value={form.pele_perilesional_eritematosa} onPress={() => toggleBool('pele_perilesional_eritematosa')} colors={colors} styles={styles} />
            <CheckItem label="Macerada" value={form.pele_perilesional_macerada} onPress={() => toggleBool('pele_perilesional_macerada')} colors={colors} styles={styles} />
            <CheckItem label="Seca e Descamativa" value={form.pele_perilesional_seca_descamativa} onPress={() => toggleBool('pele_perilesional_seca_descamativa')} colors={colors} styles={styles} />
            <CheckItem label="Eczematosa" value={form.pele_perilesional_eczematosa} onPress={() => toggleBool('pele_perilesional_eczematosa')} colors={colors} styles={styles} />
            <CheckItem label="Hiperpigmentada" value={form.pele_perilesional_hiperpigmentada} onPress={() => toggleBool('pele_perilesional_hiperpigmentada')} colors={colors} styles={styles} />
            <CheckItem label="Hipopigmentada" value={form.pele_perilesional_hipopigmentada} onPress={() => toggleBool('pele_perilesional_hipopigmentada')} colors={colors} styles={styles} />
            <CheckItem label="Indurada" value={form.pele_perilesional_indurada} onPress={() => toggleBool('pele_perilesional_indurada')} colors={colors} styles={styles} />
            <CheckItem label="Sensível" value={form.pele_perilesional_sensivel} onPress={() => toggleBool('pele_perilesional_sensivel')} colors={colors} styles={styles} />
            <CheckItem label="Edema" value={form.pele_perilesional_edema} onPress={() => toggleBool('pele_perilesional_edema')} colors={colors} styles={styles} />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-5' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-5')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="refresh-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>R - Reparo e Recomendações</Text>
          </View>
          <Ionicons name={expandedSection === 'item-5' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-5' ? (
          <View style={styles.accordionContent}>
            <Text style={styles.formLabel}>Observações e Plano de Tratamento</Text>
            <TextInput
              style={[styles.formInput, { height: 110, textAlignVertical: 'top', paddingTop: 12, marginBottom: 12 }]}
              multiline
              value={form.observacoes}
              onChangeText={text => updateField('observacoes', text)}
              placeholderTextColor={colors.placeholder}
            />

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Data da Consulta</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.data_consulta}
                  onChangeText={text => updateField('data_consulta', text)}
                  placeholder="aaaa-mm-dd"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Hora da Consulta</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.hora_consulta}
                  onChangeText={text => updateField('hora_consulta', text)}
                  placeholder="hh:mm"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>Profissional Responsável</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.profissional_responsavel}
                  onChangeText={text => updateField('profissional_responsavel', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.formLabel}>COREN/CRM</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.coren}
                  onChangeText={text => updateField('coren', text)}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Data de Retorno</Text>
            <TextInput
              style={styles.formInput}
              value={form.data_retorno}
              onChangeText={text => updateField('data_retorno', text)}
              placeholder="aaaa-mm-dd"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-6' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-6')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>S - Fatores Sociais e Histórico</Text>
          </View>
          <Ionicons name={expandedSection === 'item-6' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-6' ? (
          <View style={styles.accordionContent}>
            <DropdownField
              label="Nível de Atividade"
              value={form.nivel_atividade}
              optionsList={FORM_OPTIONS.nivelAtividade}
              fieldKey="nivel_atividade"
              onSelect={value => updateField('nivel_atividade', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
            <DropdownField
              label="Compreensão e Adesão"
              value={form.compreensao_adesao}
              optionsList={FORM_OPTIONS.compreensaoAdesao}
              fieldKey="compreensao_adesao"
              onSelect={value => updateField('compreensao_adesao', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            <Text style={styles.formLabel}>Suporte Social e Cuidadores</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top', paddingTop: 12, marginBottom: 12 }]}
              multiline
              value={form.suporte_social}
              onChangeText={text => updateField('suporte_social', text)}
              placeholderTextColor={colors.placeholder}
            />

            <CheckItem label="Prática atividade física?" value={form.pratica_atividade_fisica} onPress={() => toggleBool('pratica_atividade_fisica')} colors={colors} styles={styles} />
            {form.pratica_atividade_fisica ? (
              <>
                <TextInput
                  style={[styles.formInput, { marginBottom: 10 }]}
                  value={form.qual_atividade}
                  onChangeText={text => updateField('qual_atividade', text)}
                  placeholder="Qual atividade?"
                  placeholderTextColor={colors.placeholder}
                />
                <TextInput
                  style={[styles.formInput, { marginBottom: 10 }]}
                  value={form.frequencia_atividade}
                  onChangeText={text => updateField('frequencia_atividade', text)}
                  placeholder="Frequência"
                  placeholderTextColor={colors.placeholder}
                />
              </>
            ) : null}

            <CheckItem label="Ingere álcool?" value={form.ingestao_alcool} onPress={() => toggleBool('ingestao_alcool')} colors={colors} styles={styles} />
            {form.ingestao_alcool ? (
              <TextInput
                style={[styles.formInput, { marginBottom: 10 }]}
                value={form.frequencia_alcool}
                onChangeText={text => updateField('frequencia_alcool', text)}
                placeholder="Frequência"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}

            <CheckItem label="É fumante?" value={form.fumante} onPress={() => toggleBool('fumante')} colors={colors} styles={styles} />

            <Text style={styles.formLabel}>Avaliação Nutricional</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top', paddingTop: 12, marginBottom: 10 }]}
              multiline
              value={form.estado_nutricional}
              onChangeText={text => updateField('estado_nutricional', text)}
              placeholder="Alimentação, peso, etc."
              placeholderTextColor={colors.placeholder}
            />
            <TextInput
              style={styles.formInput}
              value={form.ingestao_agua_dia}
              onChangeText={text => updateField('ingestao_agua_dia', text)}
              placeholder="Ingestão de água por dia"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.accordionHeader, expandedSection === 'item-7' && styles.accordionHeaderActive]}
          onPress={() => toggleSection('item-7')}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="medkit-outline" size={24} color="#3B82F6" />
            <Text style={styles.accordionTitleText}>Histórico Clínico e Comorbidades</Text>
          </View>
          <Ionicons name={expandedSection === 'item-7' ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {expandedSection === 'item-7' ? (
          <View style={styles.accordionContent}>
            <Text style={styles.formLabel}>Objetivo do Tratamento</Text>
            <TextInput
              style={[styles.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 12, marginBottom: 10 }]}
              multiline
              value={form.objetivo_tratamento}
              onChangeText={text => updateField('objetivo_tratamento', text)}
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.formLabel}>Histórico de Cicatrização</Text>
            <TextInput
              style={[styles.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 12, marginBottom: 10 }]}
              multiline
              value={form.historico_cicrizacao}
              onChangeText={text => updateField('historico_cicrizacao', text)}
              placeholderTextColor={colors.placeholder}
            />

            <CheckItem label="Possui alergia?" value={form.possui_alergia} onPress={() => toggleBool('possui_alergia')} colors={colors} styles={styles} />
            {form.possui_alergia ? (
              <TextInput
                style={[styles.formInput, { marginBottom: 10 }]}
                value={form.qual_alergia}
                onChangeText={text => updateField('qual_alergia', text)}
                placeholder="Qual alergia?"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}

            <CheckItem label="Realizou cirurgias?" value={form.realizou_cirurgias} onPress={() => toggleBool('realizou_cirurgias')} colors={colors} styles={styles} />
            {form.realizou_cirurgias ? (
              <TextInput
                style={[styles.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 12, marginBottom: 10 }]}
                multiline
                value={form.quais_cirurgias}
                onChangeText={text => updateField('quais_cirurgias', text)}
                placeholder="Quais cirurgias?"
                placeholderTextColor={colors.placeholder}
              />
            ) : null}

            <Text style={styles.formLabel}>Função Vascular</Text>
            <CheckItem label="Claudicação Intermitente" value={form.claudicacao_intermitente} onPress={() => toggleBool('claudicacao_intermitente')} colors={colors} styles={styles} />
            <CheckItem label="Dor em Repouso" value={form.dor_repouso} onPress={() => toggleBool('dor_repouso')} colors={colors} styles={styles} />
            <DropdownField
              label="Pulsos Periféricos"
              value={form.pulsos_perifericos}
              optionsList={FORM_OPTIONS.pulsosPerifericos}
              fieldKey="pulsos_perifericos"
              onSelect={value => updateField('pulsos_perifericos', value)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />

            <Text style={styles.formLabel}>Comorbidades</Text>
            {COMORBIDADES_CONFIG.map(([key, label]) => (
              <CheckItem key={key} label={label} value={form[key]} onPress={() => toggleBool(key)} colors={colors} styles={styles} />
            ))}

            <Text style={styles.formLabel}>Outras Condições</Text>
            <TextInput
              style={[styles.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 12, marginBottom: 12 }]}
              multiline
              value={form.outros_hpp}
              onChangeText={text => updateField('outros_hpp', text)}
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.formLabel}>Medicamentos em Uso</Text>
            {MEDICAMENTOS_CONFIG.map(([key, label]) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <CheckItem label={label} value={form[key]} onPress={() => toggleBool(key)} colors={colors} styles={styles} />
                {renderMedicationFields({ base: key, form, updateField, colors, styles })}
              </View>
            ))}

            <Text style={styles.formLabel}>Outros Medicamentos</Text>
            <TextInput
              style={[styles.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 12 }]}
              multiline
              value={form.outros_medicamento}
              onChangeText={text => updateField('outros_medicamento', text)}
              placeholderTextColor={colors.placeholder}
            />
          </View>
        ) : null}

        <TouchableOpacity style={styles.btnSalvarAvaliacao} onPress={onSave}>
          <Text style={styles.btnEntrarText}>{avaliacaoSaveButtonLabel}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
