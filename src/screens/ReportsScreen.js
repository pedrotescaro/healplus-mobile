import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import CustomCheckbox from '../components/common/CustomCheckbox';
import RoiImageOverlay, { hasValidRois, normalizeRois } from '../components/common/RoiImageOverlay';

export default function ReportsScreen({
  styles,
  colors,
  relatorioPaciente,
  setRelatorioPaciente,
  showRelatorioDropdown,
  setShowRelatorioDropdown,
  pacientesRelatorioFilter,
  selectedPacienteRelatorio,
  activeReportEval,
  relatorioPatientEvals,
  showEvalDropdown,
  setShowEvalDropdown,
  patientEvalLabel,
  setRelatorioSelectedEvalId,
  incTimers,
  setIncTimers,
  incFotos,
  setIncFotos,
  incAnalise,
  setIncAnalise,
  incNotas,
  setIncNotas,
  exportFormat,
  setExportFormat,
  onGenerateReport,
  onBackHome,
  bottomNavProps,
}) {
  const reportImageUri =
    activeReportEval?.imageUri ||
    activeReportEval?.imagemOriginalUri ||
    activeReportEval?.woundImageUri ||
    activeReportEval?.form?.imageUri ||
    activeReportEval?.form?.imagemOriginalUri ||
    activeReportEval?.form?.woundImageUri ||
    '';
  const reportRois = normalizeRois(activeReportEval?.rois || activeReportEval?.form?.rois);
  const reportHasRoi = hasValidRois(reportRois) || normalizeRois([{ points: activeReportEval?.roiPoints || activeReportEval?.form?.roiPoints }]).some(roi => roi.points.length >= 3);

  return (
    <View style={styles.homeContainer}>
      <View style={styles.relatorioHeaderRow}>
        <TouchableOpacity onPress={onBackHome} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.relatorioHeaderTitle}>Gerar Relatório</Text>
        <Ionicons name="document-text" size={26} color={colors.primary} />
      </View>

      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.formLabel, { marginTop: 6 }]}>Selecionar Paciente</Text>
        <View style={{ zIndex: 10, marginBottom: 20 }}>
          <View style={styles.inputWithIconFlex}>
            <Ionicons name="search" size={20} color={colors.icon} />
            <TextInput
              style={[styles.formInputFlex, { marginLeft: 10 }]}
              value={relatorioPaciente}
              onChangeText={text => {
                setRelatorioPaciente(text);
                setShowRelatorioDropdown(true);
              }}
              onFocus={() => setShowRelatorioDropdown(true)}
              placeholder="Buscar paciente..."
              placeholderTextColor={colors.placeholder}
            />
            {relatorioPaciente.length > 0 && !showRelatorioDropdown ? (
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            ) : null}
          </View>

          {showRelatorioDropdown && relatorioPaciente.length > 0 ? (
            <View style={styles.dropdownContainer}>
              {pacientesRelatorioFilter.map(paciente => (
                <TouchableOpacity
                  key={paciente.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setRelatorioPaciente(paciente.nome);
                    setShowRelatorioDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{paciente.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <Text style={styles.formLabel}>Avaliação Clínica</Text>
        <View style={{ zIndex: 9, marginBottom: 15 }}>
          <TouchableOpacity
            style={[styles.inputWithIconFlex, !selectedPacienteRelatorio && { opacity: 0.6 }]}
            disabled={!selectedPacienteRelatorio}
            onPress={() => setShowEvalDropdown(!showEvalDropdown)}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.icon} />
            <Text
              style={[
                styles.formInputFlex,
                { marginLeft: 10, alignSelf: 'center', lineHeight: 28 },
                !activeReportEval && { color: colors.placeholder },
              ]}
            >
              {activeReportEval
                ? patientEvalLabel(activeReportEval)
                : selectedPacienteRelatorio
                  ? 'Escolher avaliação...'
                  : 'Selecione primeiro o paciente'}
            </Text>
            <Ionicons name={showEvalDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.icon} />
          </TouchableOpacity>

          {showEvalDropdown && selectedPacienteRelatorio ? (
            <View style={styles.dropdownContainer}>
              {relatorioPatientEvals.length === 0 ? (
                <View style={{ padding: 14 }}>
                  <Text style={styles.dropdownText}>Nenhuma avaliação encontrada.</Text>
                </View>
              ) : (
                relatorioPatientEvals.map(avaliacao => (
                  <TouchableOpacity
                    key={avaliacao.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRelatorioSelectedEvalId(avaliacao.id);
                      setShowEvalDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{patientEvalLabel(avaliacao)}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}
        </View>

        {reportImageUri ? (
          <View style={styles.reportImagePreviewCard}>
            <Text style={styles.reportImagePreviewTitle}>Imagem da avaliação</Text>
            <View style={styles.reportImagePreviewFrame}>
              <Image source={{ uri: reportImageUri }} style={styles.reportImagePreview} resizeMode="contain" />
              <RoiImageOverlay rois={reportRois} points={activeReportEval?.roiPoints || activeReportEval?.form?.roiPoints} color={colors.primary} fillColor="rgba(59, 130, 246, 0.18)" />
            </View>
            <Text style={styles.reportImageMeta}>
              {reportHasRoi ? 'ROI será exibida sobre a imagem no relatório.' : 'Sem ROI marcada nesta avaliação.'}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.formLabel, { marginTop: 20, marginBottom: 15 }]}>Incluir no Relatório</Text>
        <CustomCheckbox label="TIMERS" isChecked={incTimers} onPress={() => setIncTimers(!incTimers)} colors={colors} styles={styles} />
        <CustomCheckbox label="Fotos Comparativas" isChecked={incFotos} onPress={() => setIncFotos(!incFotos)} colors={colors} styles={styles} />
        <CustomCheckbox label="Análise AI" isChecked={incAnalise} onPress={() => setIncAnalise(!incAnalise)} colors={colors} styles={styles} />
        <CustomCheckbox label="Notas e Observações" isChecked={incNotas} onPress={() => setIncNotas(!incNotas)} colors={colors} styles={styles} />

        <Text style={[styles.formLabel, { marginTop: 25, marginBottom: 15 }]}>Exportar Como</Text>
        <View style={styles.exportCardsRow}>
          <TouchableOpacity
            style={[styles.exportCard, exportFormat === 'PDF' && styles.exportCardSelected]}
            onPress={() => setExportFormat('PDF')}
          >
            <Ionicons name="document" size={28} color="#EF4444" />
            <Text style={styles.exportCardText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportCard, exportFormat === 'Link' && styles.exportCardSelected]}
            onPress={() => setExportFormat('Link')}
          >
            <Ionicons name="link" size={28} color={colors.primary} />
            <Text style={styles.exportCardText}>Link Seguro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportCard, exportFormat === 'Email' && styles.exportCardSelected]}
            onPress={() => setExportFormat('Email')}
          >
            <Ionicons name="mail" size={28} color="#8B5CF6" />
            <Text style={styles.exportCardText}>E-mail</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnSalvarAvaliacao, { marginTop: 35, marginBottom: 30, opacity: relatorioPaciente ? 1 : 0.6 }]}
          disabled={!relatorioPaciente}
          onPress={onGenerateReport}
        >
          <Text style={styles.btnEntrarText}>Gerar Relatório</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
