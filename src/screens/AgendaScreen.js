import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import HeaderDashboard from '../components/common/HeaderDashboard';

export default function AgendaScreen({
  styles,
  colors,
  totalConsultasMes,
  mesAtivo,
  diasAgenda,
  selectedAgendaDate,
  setSelectedAgendaDate,
  infoDiaAtivo,
  consultasDoDia,
  getStatusStyles,
  onNavigateMonth,
  onEditAppointment,
  onDeleteAppointment,
  onOpenNewAppointment,
  agendaScrollFooterHeight,
  agendaFabOffsetStyle,
  headerProps,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <HeaderDashboard {...headerProps} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.agendaHeaderTopRow}>
          <View style={styles.agendaHeaderTextCol}>
            <Text style={styles.pageTitleCentralized}>Agenda de Atendimentos</Text>
            <Text style={styles.pageSubtitleCentralized}>Gerencie retornos e novos atendimentos do profissional.</Text>
          </View>
        </View>

        <View style={styles.agendaMonthSummaryCard}>
          <Text style={styles.agendaMonthSummaryTitle}>Visão do mês</Text>
          <Text style={styles.agendaMonthSummaryValue}>{totalConsultasMes} atendimentos</Text>
          <Text style={styles.agendaMonthSummaryText}>
            Use as setas para navegar entre os meses e toque em `+` para adicionar um novo horário.
          </Text>
        </View>

        <View style={styles.monthSelectorRow}>
          <TouchableOpacity style={styles.monthNavButton} onPress={() => onNavigateMonth(-1)}>
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthSelectorText}>{mesAtivo}</Text>
          <TouchableOpacity style={styles.monthNavButton} onPress={() => onNavigateMonth(1)}>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.agendaCalendarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {diasAgenda.map(dia => {
              const isAtivo = dia.dateKey === selectedAgendaDate;
              return (
                <TouchableOpacity
                  key={dia.id}
                  style={[styles.agendaDayPill, isAtivo && styles.agendaDayPillActive]}
                  onPress={() => setSelectedAgendaDate(dia.dateKey)}
                >
                  <Text style={[styles.agendaDayWeekText, isAtivo && { color: '#FFF' }]}>{dia.semana}</Text>
                  <Text style={[styles.agendaDayNumberText, isAtivo && { color: '#FFF' }]}>{dia.dia}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.agendaDailyHeader}>
          <Text style={styles.agendaDailyDateText}>{infoDiaAtivo?.nomeCompleto || 'Selecione um dia'}</Text>
          <Text style={styles.agendaDailyCountText}>{consultasDoDia.length} atendimentos neste dia</Text>
        </View>

        {consultasDoDia.length === 0 ? (
          <View style={styles.agendaEmptyCard}>
            <Ionicons name="calendar-clear-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Nenhum atendimento agendado</Text>
            <Text style={styles.emptyStateText}>Toque no botão `+` para cadastrar um novo atendimento nesta data.</Text>
          </View>
        ) : (
          consultasDoDia.map(consulta => {
            const statusStyle = getStatusStyles(consulta.status);
            return (
              <View key={consulta.id} style={styles.agendaCard}>
                <View style={styles.agendaTimeCol}>
                  <Text style={styles.agendaTimeHour}>{consulta.hora}</Text>
                  <Text style={styles.agendaTimeMin}>:{consulta.min}</Text>
                </View>
                <View style={[styles.agendaVerticalDivider, { backgroundColor: consulta.corLinha }]} />
                <View style={styles.agendaDetailsCol}>
                  <Text style={styles.agendaPatientName} numberOfLines={1}>
                    {consulta.paciente}
                  </Text>
                  <View style={styles.agendaTypeRow}>
                    <Ionicons name={consulta.icon} size={14} color={colors.textSecondary} />
                    <Text style={styles.agendaTypeText}>{consulta.tipo}</Text>
                  </View>
                  {!!consulta.observacoes && (
                    <Text style={styles.agendaObservationText} numberOfLines={2}>
                      {consulta.observacoes}
                    </Text>
                  )}
                  <View style={styles.agendaActionRow}>
                    <TouchableOpacity style={styles.agendaActionBtn} onPress={() => onEditAppointment(consulta)}>
                      <Ionicons name="create-outline" size={15} color={colors.primary} />
                      <Text style={styles.agendaActionText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.agendaActionBtn, styles.agendaDeleteBtn]}
                      onPress={() => onDeleteAppointment(consulta)}
                    >
                      <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      <Text style={styles.agendaDeleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.agendaStatusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.agendaStatusText, { color: statusStyle.color }]}>{consulta.status}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: agendaScrollFooterHeight }} />
      </ScrollView>

      <TouchableOpacity style={[styles.agendaFab, agendaFabOffsetStyle]} onPress={onOpenNewAppointment}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
