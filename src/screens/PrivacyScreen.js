import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/common/BottomNav';
import SettingsRow from '../components/common/SettingsRow';
import TopBar from '../components/common/TopBar';

export default function PrivacyScreen({
  styles,
  colors,
  hideEmailPreviewEnabled,
  showProfilePhotoEnabled,
  updateUserPreference,
  onBack,
  bottomNavProps,
}) {
  return (
    <View style={styles.homeContainer}>
      <TopBar title="Privacidade" backTo="Perfil" colors={colors} styles={styles} onBack={onBack} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsHeroCard}>
          <View style={[styles.settingsHeroIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <Text style={styles.settingsHeroTitle}>Seus dados, seu controle</Text>
          <Text style={styles.settingsHeroText}>
            Ajuste como suas informações aparecem nas telas e revise as permissões que o Heal+ usa
            no dispositivo.
          </Text>
        </View>

        <Text style={styles.profileSectionTitle}>PREVIEWS</Text>

        <SettingsRow
          icon="mail-open"
          iconColor="#10B981"
          iconBg="rgba(16, 185, 129, 0.15)"
          title="Ocultar e-mail em previews"
          subtitle="Mostra uma versão mascarada nas telas de perfil e acesso"
          rightElement={
            <Switch
              value={hideEmailPreviewEnabled}
              onValueChange={value => updateUserPreference('hideEmailPreviewEnabled', value)}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
            />
          }
          colors={colors}
          styles={styles}
        />

        <SettingsRow
          icon="image"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.15)"
          title="Exibir foto do perfil"
          subtitle="Controla se sua foto aparece nas prévias internas do app"
          rightElement={
            <Switch
              value={showProfilePhotoEnabled}
              onValueChange={value => updateUserPreference('showProfilePhotoEnabled', value)}
              trackColor={{ false: colors.switchTrackFalse, true: colors.primary }}
              thumbColor="#FFF"
            />
          }
          colors={colors}
          styles={styles}
        />

        <View style={styles.settingsInfoCard}>
          <View style={styles.settingsInfoHeader}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
            <Text style={styles.settingsInfoTitle}>Armazenamento local</Text>
          </View>
          <Text style={styles.settingsInfoText}>
            Pacientes, avaliações e agenda permanecem salvos no dispositivo. O app não depende de
            um backend externo para operar a rotina principal.
          </Text>
        </View>

        <View style={styles.settingsInfoCard}>
          <View style={styles.settingsInfoHeader}>
            <Ionicons name="camera-outline" size={18} color={colors.primary} />
            <Text style={styles.settingsInfoTitle}>Permissões de câmera e galeria</Text>
          </View>
          <Text style={styles.settingsInfoText}>
            As permissões de imagem são usadas apenas quando você escolhe anexar ou trocar fotos
            clínicas dentro das avaliações e do perfil.
          </Text>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
      <BottomNav {...bottomNavProps} />
    </View>
  );
}
