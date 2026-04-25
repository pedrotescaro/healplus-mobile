import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LOGO_IMAGE } from '../constants/appConstants';

export default function ForgotPasswordScreen({ styles, colors, onClose, onContinue }) {
  return (
    <View style={styles.forgotScreenContainer}>
      <View style={styles.forgotTopRow}>
        <View style={styles.forgotBrandPill}>
          <Image style={styles.forgotBrandLogo} source={LOGO_IMAGE} resizeMode="contain" />
          <Text style={styles.forgotBrandText}>
            Heal<Text style={styles.textBlue}>+</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.forgotCloseButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.forgotScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.forgotHeroCard}>
          <View style={styles.forgotHeroShapeOne} />
          <View style={styles.forgotHeroShapeTwo} />
          <View style={styles.forgotHeroBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#FFF" />
            <Text style={styles.forgotHeroBadgeText}>Acesso protegido</Text>
          </View>
          <Image style={styles.forgotHeroLogoMain} source={LOGO_IMAGE} resizeMode="contain" />
          <View style={styles.forgotHeroMiniCard}>
            <Ionicons name="lock-closed" size={22} color={colors.primary} />
            <Text style={styles.forgotHeroMiniCardText}>Redefinicao segura</Text>
          </View>
        </View>

        <Text style={styles.forgotTitle}>Vamos definir sua senha</Text>

        <View style={styles.forgotInfoBlock}>
          <Text style={styles.forgotInfoText}>
            <Text style={styles.forgotInfoStrong}>Atencao:</Text> o Heal+ nao solicita sua senha por
            WhatsApp, ligacao ou fora dos canais oficiais do aplicativo.
          </Text>
        </View>

        <Text style={styles.forgotHelperText}>
          Siga apenas o fluxo seguro dentro do app para proteger o acesso a sua conta profissional.
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.forgotPrimaryButton} onPress={onContinue}>
        <Text style={styles.forgotPrimaryButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}
