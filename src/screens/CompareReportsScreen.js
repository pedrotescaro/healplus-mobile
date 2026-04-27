import React from 'react';
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import DropdownField from '../components/common/DropdownField';
import RoiImageOverlay, { normalizeRois } from '../components/common/RoiImageOverlay';
import TopBar from '../components/common/TopBar';

const parseClinicalNumber = value => {
  const parsed = parseFloat(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getEvalImageUri = evaluation =>
  evaluation?.imageUri ||
  evaluation?.imagemOriginalUri ||
  evaluation?.woundImageUri ||
  evaluation?.form?.imageUri ||
  evaluation?.form?.imagemOriginalUri ||
  evaluation?.form?.woundImageUri ||
  '';

const getEvalRoiPoints = evaluation => evaluation?.roiPoints || evaluation?.form?.roiPoints || [];
const getEvalRois = evaluation => normalizeRois(evaluation?.rois || evaluation?.form?.rois);

const getEvalArea = evaluation => {
  if (evaluation?.resultados?.areaFeridaCm2) return parseClinicalNumber(evaluation.resultados.areaFeridaCm2);
  const form = evaluation?.form || {};
  return parseClinicalNumber(form.ferida_largura) * parseClinicalNumber(form.ferida_comprimento);
};

function EvolutionLineChart({ evaluations, colors, styles }) {
  const sortedEvaluations = [...(evaluations || [])].reverse();
  if (sortedEvaluations.length < 2) return null;

  const maxArea = Math.max(...sortedEvaluations.map(getEvalArea), 1);
  const series = [
    { key: 'area', label: 'Área', color: '#3B82F6', max: maxArea, getValue: getEvalArea },
    { key: 'granulacao', label: 'Granulação', color: '#EF4444', max: 100, getValue: ev => parseClinicalNumber(ev?.form?.percentual_granulacao_leito) },
    { key: 'epitelizacao', label: 'Epitelização', color: '#EC4899', max: 100, getValue: ev => parseClinicalNumber(ev?.form?.percentual_epitelizacao_leito) },
    { key: 'esfacelo', label: 'Esfacelo', color: '#F59E0B', max: 100, getValue: ev => parseClinicalNumber(ev?.form?.percentual_esfacelo_leito) },
    { key: 'necrose', label: 'Necrose', color: '#111827', max: 100, getValue: ev => parseClinicalNumber(ev?.form?.percentual_necrose_seca_leito) },
  ].filter(item => sortedEvaluations.some(ev => item.getValue(ev) > 0));

  const width = 320;
  const height = 170;
  const paddingX = 24;
  const top = 18;
  const bottom = 136;
  const rangeX = width - paddingX * 2;
  const stepX = sortedEvaluations.length > 1 ? rangeX / (sortedEvaluations.length - 1) : 0;

  const getPoint = (evaluation, index, serie) => {
    const value = serie.getValue(evaluation);
    const ratio = Math.min(Math.max(value / serie.max, 0), 1);
    return {
      x: paddingX + index * stepX,
      y: bottom - ratio * (bottom - top),
      value,
    };
  };

  return (
    <>
      <Svg width="100%" height={190} viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3].map(index => {
          const y = top + index * ((bottom - top) / 3);
          return <Line key={index} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={colors.borderLight} strokeWidth="1" />;
        })}
        {series.map(serie => {
          const points = sortedEvaluations.map((ev, index) => getPoint(ev, index, serie));
          const polyline = points.map(point => `${point.x},${point.y}`).join(' ');
          return (
            <React.Fragment key={serie.key}>
              <Polyline points={polyline} fill="none" stroke={serie.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <Circle key={`${serie.key}-${index}`} cx={point.x} cy={point.y} r="4" fill={serie.color} />
              ))}
            </React.Fragment>
          );
        })}
        {sortedEvaluations.map((evaluation, index) => (
          <SvgText
            key={evaluation.id}
            x={paddingX + index * stepX}
            y={158}
            fill={colors.textSecondary}
            fontSize="10"
            textAnchor="middle"
          >
            {String(evaluation.data || '').slice(0, 5) || `${index + 1}`}
          </SvgText>
        ))}
      </Svg>
      <View style={styles.chartLegendRow}>
        {series.map(serie => (
          <View key={serie.key} style={styles.chartLegendPill}>
            <View style={[styles.chartLegendDot, { backgroundColor: serie.color }]} />
            <Text style={styles.chartLegendText}>{serie.label}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

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
  onOpenEvalDetails,
  onCompareEvalFromSequence,
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
                      {getEvalImageUri(compareEvalA) ? (
                        <>
                          <Image source={{ uri: getEvalImageUri(compareEvalA) }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                          <RoiImageOverlay rois={getEvalRois(compareEvalA)} points={getEvalRoiPoints(compareEvalA)} color={colors.primary} fillColor="rgba(59, 130, 246, 0.18)" showPoints={false} />
                        </>
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
                      {getEvalImageUri(compareEvalB) ? (
                        <>
                          <Image source={{ uri: getEvalImageUri(compareEvalB) }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                          <RoiImageOverlay rois={getEvalRois(compareEvalB)} points={getEvalRoiPoints(compareEvalB)} color={colors.primary} fillColor="rgba(59, 130, 246, 0.18)" showPoints={false} />
                        </>
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

                {compareEvals.length >= 2 ? (
                  <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                      <Text style={styles.chartTitle}>Gráficos Evolutivos</Text>
                      <Text style={styles.chartBadgeText}>{compareEvals.length} avaliações</Text>
                    </View>
                    <EvolutionLineChart evaluations={compareEvals} colors={colors} styles={styles} />
                  </View>
                ) : null}

                {compareEvals.length ? (
                  <>
                    <Text style={styles.homeSectionHeading}>Sequência de Avaliações</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evalSequenceScroll}>
                      {compareEvals.map(avaliacao => {
                        const imageUri = getEvalImageUri(avaliacao);
                        const area = getEvalArea(avaliacao);

                        return (
                          <View key={avaliacao.id} style={styles.evalSequenceCard}>
                            <View style={styles.evalSequenceImage}>
                              {imageUri ? (
                                <>
                                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                                  <RoiImageOverlay rois={getEvalRois(avaliacao)} points={getEvalRoiPoints(avaliacao)} color={colors.primary} fillColor="rgba(59, 130, 246, 0.18)" showPoints={false} />
                                </>
                              ) : (
                                <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
                              )}
                            </View>
                            <Text style={styles.evalSequenceTitle}>{avaliacao.data || 'Sem data'}</Text>
                            <Text style={styles.evalSequenceMeta}>{avaliacao.regiao || avaliacao.form?.localizacao_ferida || 'Sem região'}</Text>
                            <Text style={styles.evalSequenceMeta}>Área {area.toFixed(1)} cm²</Text>
                            <Text style={styles.evalSequenceMeta}>
                              Gran. {avaliacao.form?.percentual_granulacao_leito || 0}% • Esfac. {avaliacao.form?.percentual_esfacelo_leito || 0}%
                            </Text>
                            <View style={styles.evalSequenceActions}>
                              <TouchableOpacity style={styles.evalSequenceButton} onPress={() => onOpenEvalDetails(avaliacao)}>
                                <Text style={styles.evalSequenceButtonText}>Detalhes</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.evalSequenceButton} onPress={() => onCompareEvalFromSequence(avaliacao)}>
                                <Text style={styles.evalSequenceButtonText}>Comparar</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </>
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
