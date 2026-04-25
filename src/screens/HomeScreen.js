import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import HeaderDashboard from '../components/common/HeaderDashboard';

export default function HomeScreen({
  styles,
  colors,
  userName,
  pacientesAtivos,
  totalAvaliacoes,
  onOpenChat,
  onOpenNewEvaluation,
  onOpenPatients,
  onOpenReport,
  onOpenCompare,
  headerProps,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <HeaderDashboard {...headerProps} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeScrollContent}>
        <TouchableOpacity activeOpacity={0.9} onPress={onOpenChat}>
          <View style={styles.homeSearchPill}>
            <Ionicons name="sparkles-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.homeSearchText}>Pergunte ou pesquise</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.homeHeroCard}>
          <Text style={styles.homeHeroTitle}>Ola, Dr. {userName.split(' ')[0]}.</Text>
          <Text style={styles.homeHeroSubtitle}>Sua central de gestao inteligente de feridas.</Text>
        </View>

        <View style={styles.homeQuickPills}>
          <TouchableOpacity style={styles.homeQuickPill} onPress={onOpenNewEvaluation}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
            <Text style={styles.homeQuickPillText}>Avaliacao</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeQuickPill} onPress={onOpenPatients}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={styles.homeQuickPillText}>Pacientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeQuickPill} onPress={onOpenReport}>
            <Ionicons name="document-text" size={14} color={colors.primary} />
            <Text style={styles.homeQuickPillText}>Relatorio</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.homeSectionHeading}>Evolucao de casos</Text>
        <View style={styles.homeStatsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statHeaderCentered}>
              <Ionicons name="people" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{pacientesAtivos.length}</Text>
            </View>
            <Text style={styles.statLabel}>pacientes ativos</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statHeaderCentered}>
              <Ionicons name="clipboard-outline" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{totalAvaliacoes}</Text>
            </View>
            <Text style={styles.statLabel}>Novas Avaliacoes</Text>
          </View>
        </View>

        <Text style={styles.homeSectionHeading}>Atalhos Rapidos</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem} onPress={onOpenNewEvaluation}>
            <Ionicons name="create-outline" size={36} color={colors.primary} />
            <Text style={styles.gridItemText}>Nova Avaliacao</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={onOpenReport}>
            <Ionicons name="document-text-outline" size={36} color={colors.primary} />
            <Text style={styles.gridItemText}>Gerar Relatorio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={onOpenPatients}>
            <Ionicons name="people-outline" size={36} color={colors.primary} />
            <Text style={styles.gridItemText}>Pacientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={onOpenCompare}>
            <Ionicons name="copy-outline" size={36} color={colors.primary} />
            <Text style={styles.gridItemText}>Comparar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav {...bottomNavProps} />
    </View>
  );
}
