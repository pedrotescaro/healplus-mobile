import React, { useState, useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import HeaderDashboard from '../components/common/HeaderDashboard';

const POPUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const POPUP_AUTO_DISMISS_MS = 6000;       // auto-close after 6s

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
  const [tipVisible, setTipVisible] = useState(true);
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const autoDismissRef = useRef(null);

  const showTip = () => {
    setTipVisible(true);
    Animated.timing(tipOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    autoDismissRef.current = setTimeout(() => {
      dismissTip();
    }, POPUP_AUTO_DISMISS_MS);
  };

  const dismissTip = () => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }
    Animated.timing(tipOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setTipVisible(false));
  };

  useEffect(() => {
    // Show immediately on mount
    showTip();

    // Then repeat every 5 minutes
    intervalRef.current = setInterval(() => {
      showTip();
    }, POPUP_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {/* Popup tip — appears on mount then every 5 minutes */}
      {tipVisible && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: tipOpacity,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={dismissTip}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
            }}
          />
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 22,
              marginHorizontal: 28,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 24,
              elevation: 12,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary + '18',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              Visão do mês
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: '800',
                marginBottom: 8,
              }}
            >
              {totalConsultasMes} atendimentos
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 20,
                textAlign: 'center',
                marginBottom: 18,
              }}
            >
              Use as setas para navegar entre os meses e toque em{' '}
              <Text style={{ fontWeight: '700', color: colors.primary }}>+</Text> para adicionar um novo horário.
            </Text>

            <TouchableOpacity
              onPress={dismissTip}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 10,
                paddingHorizontal: 32,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
