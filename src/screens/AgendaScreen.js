import React, { useState, useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import HeaderDashboard from '../components/common/HeaderDashboard';
import { AGENDA_ONBOARDING_STORAGE_KEY } from '../constants/appConstants';
import { getStoredValue, setStoredValue } from '../storage/appStorage';

const AGENDA_GUIDE_SLIDES = [
  {
    id: 'month',
    icon: 'calendar-outline',
    eyebrow: 'Visão do mês',
    title: 'Encontre o dia certo',
    description:
      'Use as setas para trocar de mês e toque em um dia para ver todos os atendimentos marcados.',
    points: ['O contador mostra quantos retornos existem no mês', 'O dia selecionado filtra a lista abaixo'],
  },
  {
    id: 'new',
    icon: 'add-circle-outline',
    eyebrow: 'Novo atendimento',
    title: 'Cadastre pelo botão +',
    description:
      'O botão azul abre o formulário para escolher paciente, data, horário, tipo e status do atendimento.',
    points: ['Você pode digitar um paciente ou selecionar um cadastrado', 'Observações ajudam a lembrar detalhes do retorno'],
  },
  {
    id: 'manage',
    icon: 'create-outline',
    eyebrow: 'Rotina do dia',
    title: 'Acompanhe e edite',
    description:
      'Cada card mostra horário, paciente, tipo e status. Use editar ou excluir quando a agenda mudar.',
    points: ['Status deixam o dia mais fácil de escanear', 'Tudo fica salvo na agenda local do app'],
  },
];

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
  const [agendaGuideVisible, setAgendaGuideVisible] = useState(false);
  const [agendaGuideStep, setAgendaGuideStep] = useState(0);
  const agendaGuideOpacity = useRef(new Animated.Value(0)).current;
  const currentAgendaGuideSlide = AGENDA_GUIDE_SLIDES[agendaGuideStep];
  const isLastAgendaGuideStep = agendaGuideStep === AGENDA_GUIDE_SLIDES.length - 1;

  useEffect(() => {
    let isMounted = true;

    const loadAgendaGuide = async () => {
      const hasSeenAgendaGuide = await getStoredValue(AGENDA_ONBOARDING_STORAGE_KEY);
      if (!isMounted || hasSeenAgendaGuide === '1') return;

      setAgendaGuideVisible(true);
      agendaGuideOpacity.setValue(0);
      Animated.timing(agendaGuideOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    };

    loadAgendaGuide();

    return () => {
      isMounted = false;
      agendaGuideOpacity.stopAnimation();
    };
  }, [agendaGuideOpacity]);

  const closeAgendaGuide = async () => {
    await setStoredValue(AGENDA_ONBOARDING_STORAGE_KEY, '1');
    Animated.timing(agendaGuideOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setAgendaGuideVisible(false);
      setAgendaGuideStep(0);
    });
  };

  const nextAgendaGuideStep = () => {
    if (isLastAgendaGuideStep) {
      closeAgendaGuide();
      return;
    }

    setAgendaGuideStep(prev => Math.min(prev + 1, AGENDA_GUIDE_SLIDES.length - 1));
  };

  const previousAgendaGuideStep = () => {
    setAgendaGuideStep(prev => Math.max(prev - 1, 0));
  };

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

      {agendaGuideVisible && currentAgendaGuideSlide && (
        <Animated.View style={[styles.agendaGuideOverlay, { opacity: agendaGuideOpacity }]}>
          <View style={styles.agendaGuideCard}>
            <TouchableOpacity style={styles.agendaGuideCloseButton} onPress={closeAgendaGuide}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.agendaGuideIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={currentAgendaGuideSlide.icon} size={34} color={colors.primary} />
            </View>

            <Text style={styles.agendaGuideEyebrow}>{currentAgendaGuideSlide.eyebrow}</Text>
            <Text style={styles.agendaGuideTitle}>{currentAgendaGuideSlide.title}</Text>
            <Text style={styles.agendaGuideText}>{currentAgendaGuideSlide.description}</Text>

            <View style={styles.agendaGuideList}>
              {currentAgendaGuideSlide.points.map(point => (
                <View key={point} style={styles.agendaGuideListItem}>
                  <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
                  <Text style={styles.agendaGuideListText}>{point}</Text>
                </View>
              ))}
            </View>

            <View style={styles.onboardingDotsRow}>
              {AGENDA_GUIDE_SLIDES.map((slide, index) => {
                const isActive = index === agendaGuideStep;
                return (
                  <TouchableOpacity
                    key={slide.id}
                    activeOpacity={0.8}
                    onPress={() => setAgendaGuideStep(index)}
                    style={[
                      styles.onboardingDot,
                      isActive && styles.onboardingDotActive,
                      isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.onboardingButtonsRow}>
              <TouchableOpacity
                style={styles.onboardingGhostButton}
                onPress={agendaGuideStep === 0 ? closeAgendaGuide : previousAgendaGuideStep}
              >
                <Text style={styles.onboardingGhostButtonText}>
                  {agendaGuideStep === 0 ? 'Pular' : 'Voltar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.onboardingPrimaryButton} onPress={nextAgendaGuideStep}>
                <Text style={styles.onboardingPrimaryButtonText}>
                  {isLastAgendaGuideStep ? 'Entendi' : 'Próximo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
