import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import SettingsRow from '../components/common/SettingsRow';
import TopBar from '../components/common/TopBar';

export default function NotificationsScreen({
  styles,
  colors,
  isNotificacoesEnabled,
  setIsNotificacoesEnabled,
  agendaRemindersEnabled,
  emailNotificationsEnabled,
  updateUserPreference,
  onBack,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <TopBar title="Notificacoes" backTo="Perfil" colors={colors} styles={styles} onBack={onBack} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsHeroCard}>
          <View style={[styles.settingsHeroIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="notifications" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.settingsHeroTitle}>Preferencias de aviso</Text>
          <Text style={styles.settingsHeroText}>
            Defina como o Heal+ deve sinalizar lembretes, agenda e comunicacoes do seu fluxo.
          </Text>
        </View>

        <Text style={styles.profileSectionTitle}>ALERTAS</Text>

        <SettingsRow
          icon="notifications"
          iconColor="#F59E0B"
          iconBg="rgba(245, 158, 11, 0.15)"
          title="Notificacoes gerais"
          subtitle="Liga ou desliga todos os avisos do aplicativo"
          rightElement={
            <Switch
              value={isNotificacoesEnabled}
              onValueChange={setIsNotificacoesEnabled}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
            />
          }
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="calendar"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.15)"
          title="Lembretes da agenda"
          subtitle="Avisos para retornos, trocas e atendimentos do dia"
          disabled={!isNotificacoesEnabled}
          rightElement={
            <Switch
              value={agendaRemindersEnabled}
              onValueChange={value => updateUserPreference('agendaRemindersEnabled', value)}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
              disabled={!isNotificacoesEnabled}
            />
          }
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="mail"
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.15)"
          title="Resumo por e-mail"
          subtitle="Mantem o canal de contato preparado para futuras comunicacoes"
          disabled={!isNotificacoesEnabled}
          rightElement={
            <Switch
              value={emailNotificationsEnabled}
              onValueChange={value => updateUserPreference('emailNotificationsEnabled', value)}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
              disabled={!isNotificacoesEnabled}
            />
          }
          colors={colors}
          styles={styles}
        />

        <View style={styles.settingsInfoCard}>
          <View style={styles.settingsInfoHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.settingsInfoTitle}>Como isso funciona</Text>
          </View>
          <Text style={styles.settingsInfoText}>
            Ao desativar as notificacoes gerais, os canais complementares ficam pausados dentro do
            app ate voce reativar os avisos.
          </Text>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
      <BottomNav {...bottomNavProps} />
    </View>
  );
}
