import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { APP_VERSION, LOGO_IMAGE } from '../constants/appConstants';
import BottomNav from '../components/common/BottomNav';
import SettingsRow from '../components/common/SettingsRow';
import TopBar from '../components/common/TopBar';

export default function AboutAppScreen({
  styles,
  colors,
  isDark,
  onOpenPrivacy,
  onOpenChatBotInfo,
  onBack,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <TopBar title="Sobre o App" backTo="Perfil" colors={colors} styles={styles} onBack={onBack} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.aboutHeroCard}>
          <View style={styles.aboutBrandRow}>
            <Image style={styles.aboutBrandLogo} source={LOGO_IMAGE} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutBrandTitle}>Heal+</Text>
              <Text style={styles.aboutBrandSubtitle}>
                Gestão clínica local com foco em agilidade e organização.
              </Text>
            </View>
          </View>
          <View style={styles.aboutVersionPill}>
            <Text style={styles.aboutVersionPillText}>Versão {APP_VERSION}</Text>
          </View>
        </View>

        <View style={styles.settingsInfoCard}>
          <View style={styles.settingsInfoHeader}>
            <Ionicons name="server-outline" size={18} color={colors.primary} />
            <Text style={styles.settingsInfoTitle}>Base local</Text>
          </View>
          <Text style={styles.settingsInfoText}>
            O Heal+ mantém pacientes, agenda e relatórios diretamente no dispositivo para deixar o
            fluxo rápido e disponível mesmo sem depender de serviços externos.
          </Text>
        </View>

        <View style={styles.settingsInfoCard}>
          <View style={styles.settingsInfoHeader}>
            <Ionicons name="contrast-outline" size={18} color={colors.primary} />
            <Text style={styles.settingsInfoTitle}>Tema atual</Text>
          </View>
          <Text style={styles.settingsInfoText}>
            O app está usando o modo {isDark ? 'escuro' : 'claro'} neste momento. Você pode alterar
            isso a qualquer hora na tela de Perfil.
          </Text>
        </View>

        <Text style={styles.profileSectionTitle}>ACESSOS RÁPIDOS</Text>

        <SettingsRow
          icon="shield-checkmark"
          iconColor="#10B981"
          iconBg="rgba(16, 185, 129, 0.15)"
          title="Privacidade"
          subtitle="Revisar dados e permissões"
          onPress={onOpenPrivacy}
          showChevron
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="chatbubble-ellipses-outline"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.15)"
          title="Sobre o Assistente"
          subtitle="Entender como a IA local funciona no app"
          onPress={onOpenChatBotInfo}
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
