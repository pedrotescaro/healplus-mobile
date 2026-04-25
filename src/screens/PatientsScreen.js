import React from 'react';
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import HeaderDashboard from '../components/common/HeaderDashboard';
import ShortcutButton from '../components/common/ShortcutButton';

export default function PatientsScreen({
  styles,
  colors,
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  pacientesFiltrados,
  pacientesArquivadosFiltrados,
  onOpenNewEvaluation,
  onOpenNewPatientModal,
  onOpenReport,
  onOpenCompare,
  renderPatientHeaderActions,
  renderPatientEvaluationItem,
  headerProps,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <HeaderDashboard {...headerProps} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.patientsHeroSection}>
          <Text style={styles.pageTitlePacientes}>Meus Pacientes</Text>
          <Text style={styles.pageSubtitlePacientes}>Gerencie seus registros clínicos e históricos</Text>

          <View style={styles.patientsSearchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.patientsSearchInput}
              placeholder="Pesquise pacientes ou registros..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.patientsActionRow}>
            <ShortcutButton icon="create-outline" label="Avaliação" onPress={onOpenNewEvaluation} colors={colors} styles={styles} />
            <ShortcutButton icon="person-add-outline" label="Paciente" onPress={onOpenNewPatientModal} colors={colors} styles={styles} />
            <ShortcutButton icon="document-text-outline" label="Relatório" onPress={onOpenReport} colors={colors} styles={styles} />
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Mostrar arquivados</Text>
          <Switch
            value={showArchived}
            onValueChange={setShowArchived}
            trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {pacientesFiltrados.map(paciente => (
          <View key={paciente.id} style={styles.patientCard}>
            <View style={styles.patientCardHeader}>
              <View style={styles.patientNameRow}>
                <Ionicons name="person-circle-outline" size={32} color="#3B82F6" />
                <View style={styles.patientNameContent}>
                  <Text style={styles.patientNameText}>{paciente.nome}</Text>
                  <Text style={styles.patientMiniInfo}>{paciente.telefone || paciente.email || 'Sem contato'}</Text>
                </View>
              </View>
              {renderPatientHeaderActions(paciente)}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <TouchableOpacity style={styles.smallActionPill} onPress={() => onOpenNewEvaluation(paciente)}>
                <Ionicons name="add-circle-outline" size={15} color="#3B82F6" />
                <Text style={styles.smallActionPillText}>Avaliar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallActionPill} onPress={() => onOpenReport(paciente.id)}>
                <Ionicons name="document-text-outline" size={15} color="#3B82F6" />
                <Text style={styles.smallActionPillText}>Relatório</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallActionPill} onPress={() => onOpenCompare(paciente.id)}>
                <Ionicons name="git-compare-outline" size={15} color="#3B82F6" />
                <Text style={styles.smallActionPillText}>Comparar</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.patientRecordsContainer}>
              {(paciente.avaliacoes || []).length === 0 ? (
                <Text style={{ color: colors.textSecondary, fontStyle: 'italic', paddingVertical: 5 }}>
                  Nenhuma avaliação registrada ainda.
                </Text>
              ) : (
                paciente.avaliacoes.map((avaliacao, index) =>
                  renderPatientEvaluationItem(paciente, avaliacao, index)
                )
              )}
            </View>
          </View>
        ))}

        {showArchived && pacientesArquivadosFiltrados.length > 0 ? (
          <>
            <Text style={styles.archivedSectionTitle}>Pacientes Arquivados</Text>
            {pacientesArquivadosFiltrados.map(paciente => (
              <View key={paciente.id} style={[styles.patientCard, { opacity: 0.8 }]}>
                <View style={styles.patientCardHeader}>
                  <View style={styles.patientNameRow}>
                    <Ionicons name="archive-outline" size={28} color="#F59E0B" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.patientNameText}>{paciente.nome}</Text>
                      <Text style={styles.patientMiniInfo}>
                        Arquivado em {paciente.archivedAt ? paciente.archivedAt.slice(0, 10) : '-'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.archivedInfoText}>
                  Registro preservado por regra de negócio. Histórico permanece salvo.
                </Text>
              </View>
            ))}
          </>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
