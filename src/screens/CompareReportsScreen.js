import React from 'react';
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DropdownField from '../components/common/DropdownField';
import TopBar from '../components/common/TopBar';

export default function CompareReportsScreen({
  styles,
  colors,
  compareSearchQuery,
  setCompareSearchQuery,
  showCompareDropdown,
  setShowCompareDropdown,
  pacientesCompareFilter,
  setComparePatientId,
  setCompareEvalAId,
  setCompareEvalBId,
  comparePatient,
  comparePatientId,
  patientsWithCompare,
  compareEvalA,
  compareEvalB,
  compareEvals,
  patientEvalLabel,
  compareAreaA,
  compareAreaB,
  compareHasValidChart,
  compareAreaReductionColor,
  compareAreaReductionText,
  compareMaxChartArea,
  handleExportarComparativo,
  openDropdown,
  setOpenDropdown,
  androidBottomInset,
  onBack,
}) {
  return (
    <View style={styles.homeContainer}>
      <TopBar title="Comparação" backTo="Home" colors={colors} styles={styles} onBack={onBack} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.formLabel}>Selecionar Paciente</Text>
        <View style={{ zIndex: 10, marginBottom: 15 }}>
          <View style={styles.inputWithIconFlex}>
            <Ionicons name="search" size={20} color={colors.icon} />
            <TextInput
              style={[styles.formInputFlex, { marginLeft: 10 }]}
              placeholder="Buscar paciente..."
              placeholderTextColor={colors.placeholder}
              value={compareSearchQuery}
              onChangeText={text => {
                setCompareSearchQuery(text);
                setShowCompareDropdown(true);
              }}
              onFocus={() => setShowCompareDropdown(true)}
            />
            {compareSearchQuery.length > 0 && !showCompareDropdown ? (
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            ) : null}
          </View>

          {showCompareDropdown && compareSearchQuery.length > 0 ? (
            <View style={styles.dropdownContainer}>
              {pacientesCompareFilter.length === 0 ? (
                <View style={{ padding: 14 }}>
                  <Text style={styles.dropdownText}>Nenhum paciente encontrado com duas avaliações.</Text>
                </View>
              ) : (
                pacientesCompareFilter.map(paciente => (
                  <TouchableOpacity
                    key={paciente.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCompareSearchQuery(paciente.nome);
                      setShowCompareDropdown(false);
                      setComparePatientId(paciente.id);
                      setCompareEvalAId(paciente.avaliacoes[0]?.id || null);
                      setCompareEvalBId(paciente.avaliacoes[1]?.id || null);
                    }}
                  >
                    <Text style={styles.dropdownText}>{paciente.nome}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25, zIndex: 9 }}>
          <View style={{ flex: 1 }}>
            <DropdownField
              label="Relatório Inicial"
              value={compareEvalA ? patientEvalLabel(compareEvalA) : ''}
              optionsList={compareEvals.map(ev => patientEvalLabel(ev))}
              fieldKey="compare_a"
              onSelect={label => {
                const selected = compareEvals.find(ev => patientEvalLabel(ev) === label);
                setCompareEvalAId(selected?.id || null);
              }}
              placeholder="Selecione"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
          </View>
          <View style={{ flex: 1 }}>
            <DropdownField
              label="Relatório Recente"
              value={compareEvalB ? patientEvalLabel(compareEvalB) : ''}
              optionsList={compareEvals.map(ev => patientEvalLabel(ev))}
              fieldKey="compare_b"
              onSelect={label => {
                const selected = compareEvals.find(ev => patientEvalLabel(ev) === label);
                setCompareEvalBId(selected?.id || null);
              }}
              placeholder="Selecione"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>

        {!comparePatient ? (
          <>
            <Text style={[styles.pageTitleCentralized, { marginBottom: 20 }]}>Selecione um Paciente</Text>
            {patientsWithCompare.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
                Nenhum paciente possui 2 ou mais avaliações para comparar. Adicione novas avaliações no painel do paciente.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {patientsWithCompare.map(paciente => (
                  <TouchableOpacity
                    key={paciente.id}
                    style={[
                      styles.selectPatientPill,
                      comparePatientId === paciente.id && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setCompareSearchQuery(paciente.nome);
                      setComparePatientId(paciente.id);
                      setCompareEvalAId(paciente.avaliacoes[0]?.id || null);
                      setCompareEvalBId(paciente.avaliacoes[1]?.id || null);
                    }}
                  >
                    <Text style={[styles.selectPatientText, comparePatientId === paciente.id && { color: '#FFF' }]}>
                      {paciente.nome.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.pageTitleCentralized, { marginBottom: 20 }]}>{comparePatient.nome}</Text>

            {compareEvalA && compareEvalB ? (
              <>
                <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
                  <View style={styles.compareCard}>
                    <View style={[styles.compareBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                      <Text style={[styles.compareBadgeText, { color: '#EF4444' }]}>ANTES</Text>
                    </View>
                    <View style={styles.compareImagePlaceholder}>
                      {compareEvalA?.form?.woundImageUri ? (
                        <Image source={{ uri: compareEvalA.form.woundImageUri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                      ) : (
                        <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.compareCardDate}>{compareEvalA.data || '14/01'}</Text>
                    <View style={styles.compareCardStatRow}>
                      <Text style={styles.compareCardStatLabel}>Área</Text>
                      <Text style={styles.compareCardStatValue}>{compareAreaA.toFixed(1)} cm²</Text>
                    </View>
                    <View style={styles.compareCardStatRow}>
                      <Text style={styles.compareCardStatLabel}>TIMERS</Text>
                      <Text style={[styles.compareCardStatValue, { color: '#EF4444' }]}>18</Text>
                    </View>
                  </View>

                  <View style={styles.compareCard}>
                    <View style={[styles.compareBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Text style={[styles.compareBadgeText, { color: '#10B981' }]}>AGORA</Text>
                    </View>
                    <View style={styles.compareImagePlaceholder}>
                      {compareEvalB?.form?.woundImageUri ? (
                        <Image source={{ uri: compareEvalB.form.woundImageUri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                      ) : (
                        <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.compareCardDate}>{compareEvalB.data || '28/03'}</Text>
                    <View style={styles.compareCardStatRow}>
                      <Text style={styles.compareCardStatLabel}>Área</Text>
                      <Text style={styles.compareCardStatValue}>{compareAreaB.toFixed(1)} cm²</Text>
                    </View>
                    <View style={styles.compareCardStatRow}>
                      <Text style={[styles.compareCardStatValue, { color: '#10B981' }]}>12</Text>
                      <Text style={styles.compareCardStatLabel}>TIMERS</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingHorizontal: 10 }}>
                  <Ionicons name="image-outline" size={16} color={colors.textSecondary} />
                  <View style={{ flex: 1, height: 4, backgroundColor: colors.borderLight, marginHorizontal: 10, borderRadius: 2 }}>
                    <View style={{ width: '50%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 2 }} />
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: '50%',
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#FFF',
                        borderWidth: 4,
                        borderColor: '#3B82F6',
                        marginLeft: -8,
                      }}
                    />
                  </View>
                  <Ionicons name="image-outline" size={16} color={colors.textSecondary} />
                </View>

                {compareHasValidChart ? (
                  <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                      <Text style={styles.chartTitle}>Comparativo de Área</Text>
                      <Text style={[styles.chartBadgeText, { color: compareAreaReductionColor }]}>
                        {compareAreaReductionText}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', height: 160, alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 20 }}>
                      <View style={{ alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <Text style={{ marginBottom: 4, color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                          {compareAreaA.toFixed(1)} cm²
                        </Text>
                        <View
                          style={{
                            width: 50,
                            height: `${(compareAreaA / compareMaxChartArea) * 70}%`,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            minHeight: 4,
                          }}
                        />
                        <Text style={{ marginTop: 8, color: '#8E8E93', fontSize: 12, fontWeight: '500' }}>
                          {compareEvalA.data?.split(' ')[0] || 'Avaliação A'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <Text style={{ marginBottom: 4, color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                          {compareAreaB.toFixed(1)} cm²
                        </Text>
                        <View
                          style={{
                            width: 50,
                            height: `${(compareAreaB / compareMaxChartArea) * 70}%`,
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            minHeight: 4,
                          }}
                        />
                        <Text style={{ marginTop: 8, color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>
                          {compareEvalB.data?.split(' ')[0] || 'Avaliação B'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.homeSectionHeading}>Comparativo Clínico</Text>

                <View style={styles.comparativoClinicoContainer}>
                  <View style={styles.comparativoRow}>
                    <Text style={styles.comparativoLabelTop}>T - Tecido</Text>
                    <View style={styles.comparativoValRow}>
                      <Text style={styles.comparativoValTextRowLeft}>
                        {(compareEvalA?.form?.percentual_esfacelo_leito || 70) + '% Esfacelo'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#10B981" />
                      <Text style={styles.comparativoValTextRowRight}>
                        {(compareEvalB?.form?.percentual_granulacao_leito || 90) + '% Granulação'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.comparativoDivider} />

                  <View style={styles.comparativoRow}>
                    <Text style={styles.comparativoLabelTop}>I - Infecção</Text>
                    <View style={styles.comparativoValRow}>
                      <Text style={styles.comparativoValTextRowLeft}>Sinais Clínicos</Text>
                      <Ionicons name="arrow-forward" size={16} color="#10B981" />
                      <Text style={styles.comparativoValTextRowRight}>
                        {compareEvalB?.form?.infeccao_exsudato ? 'Com Infecção' : 'Sem Infecção'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.comparativoDivider} />

                  <View style={styles.comparativoRow}>
                    <Text style={styles.comparativoLabelTop}>M - Umidade</Text>
                    <View style={styles.comparativoValRow}>
                      <Text style={styles.comparativoValTextRowLeft}>
                        {compareEvalA?.form?.quantidade_exsudato || 'Exsudato Alto'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#10B981" />
                      <Text style={styles.comparativoValTextRowRight}>
                        {compareEvalB?.form?.quantidade_exsudato || 'Exsudato Baixo'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.comparativoDivider} />

                  <View style={styles.comparativoRow}>
                    <Text style={styles.comparativoLabelTop}>E - Bordas</Text>
                    <View style={styles.comparativoValRow}>
                      <Text style={styles.comparativoValTextRowLeft}>
                        {compareEvalA?.form?.bordas_caracteristicas || 'Maceradas'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#10B981" />
                      <Text style={styles.comparativoValTextRowRight}>
                        {compareEvalB?.form?.bordas_caracteristicas || 'Aderidas'}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnExportarPdfComparativo} onPress={handleExportarComparativo}>
                  <Ionicons name="document-text" size={20} color="#FFF" />
                  <Text style={styles.btnExportarPdfText}>Exportar PDF</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}

        <View style={{ height: 40 + (Platform.OS === 'android' ? androidBottomInset : 0) }} />
      </ScrollView>
    </View>
  );
}
