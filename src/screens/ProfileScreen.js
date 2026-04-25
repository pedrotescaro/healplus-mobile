import React from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { APP_VERSION } from '../constants/appConstants';
import BottomNav from '../components/common/BottomNav';
import SettingsRow from '../components/common/SettingsRow';

export default function ProfileScreen({
  styles,
  colors,
  isDark,
  toggleTheme,
  userName,
  userPhoto,
  previewUserEmail,
  showUserPhotoPreview,
  totalAvaliacoes,
  pacientesAtivos,
  isNotificacoesEnabled,
  setIsNotificacoesEnabled,
  onOpenPrivacy,
  onOpenEditProfile,
  onOpenNotifications,
  onOpenAbout,
  onLogout,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderSideSpacer} />
        <Text style={styles.profileHeaderTitle}>Perfil</Text>
        <TouchableOpacity style={styles.profileSettingsBtn} onPress={onOpenPrivacy}>
          <View style={styles.profileSettingsIconBox}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfoContainer}>
          <View style={[styles.profileAvatarWrapper, { overflow: 'hidden' }]}>
            <View style={styles.profileAvatarInner}>
              {showUserPhotoPreview ? (
                <Image source={{ uri: userPhoto }} style={{ width: '100%', height: '100%', borderRadius: 60 }} />
              ) : (
                <Text style={styles.profileAvatarTextLarge}>
                  {userName
                    .split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.profileNameText}>{userName}</Text>
          <Text style={styles.profileEmailText}>{previewUserEmail}</Text>
        </View>

        <View style={styles.metricsCard}>
          <View style={styles.metricsHeader}>
            <Ionicons name="bar-chart-outline" size={20} color="#3B82F6" />
            <Text style={styles.metricsTitle}>Métricas de Performance</Text>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{totalAvaliacoes}</Text>
              <Text style={styles.metricLabel}>Avaliações{`\n`}este mês</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{pacientesAtivos.length}</Text>
              <Text style={styles.metricLabel}>Pacientes{`\n`}ativos</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricValue, { color: '#F59E0B', fontSize: 18, marginTop: 4, marginBottom: 2 }]}>
                Local{`\n`}DB
              </Text>
              <Text style={styles.metricLabel}>Persistência{`\n`}Ativa</Text>
            </View>
          </View>
        </View>

        <Text style={styles.profileSectionTitle}>CONTA</Text>

        <SettingsRow
          icon="person"
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.15)"
          title="Editar Perfil"
          subtitle="Nome, foto e informações"
          onPress={onOpenEditProfile}
          showChevron
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="notifications"
          iconColor="#F59E0B"
          iconBg="rgba(245, 158, 11, 0.15)"
          title="Notificações"
          subtitle={isNotificacoesEnabled ? 'Push, email e alertas' : 'Notificações desativadas'}
          onPress={onOpenNotifications}
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
          icon="shield-checkmark"
          iconColor="#10B981"
          iconBg="rgba(16, 185, 129, 0.15)"
          title="Privacidade"
          subtitle="Dados e permissões"
          onPress={onOpenPrivacy}
          showChevron
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="moon"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.15)"
          title="Modo Escuro"
          subtitle={isDark ? 'Ativado' : 'Desativado'}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
            />
          }
          colors={colors}
          styles={styles}
        />

        <View style={styles.profileMenuSpacer} />

        <SettingsRow
          icon="information-circle"
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.15)"
          title="Sobre o App"
          subtitle={`Versão ${APP_VERSION}`}
          onPress={onOpenAbout}
          showChevron
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="log-out"
          iconColor="#EF4444"
          iconBg="rgba(239, 68, 68, 0.15)"
          title="Sair da Conta"
          subtitle="Desconectar dispositivo"
          onPress={onLogout}
          danger
          showChevron
          colors={colors}
          styles={styles}
        />

        <View style={{ height: 18 }} />
      </ScrollView>

      <BottomNav {...bottomNavProps} />
    </View>
  );
}
