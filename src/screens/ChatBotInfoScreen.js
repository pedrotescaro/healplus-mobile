import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TopBar from '../components/common/TopBar';

export default function ChatBotInfoScreen({
  styles,
  colors,
  chatInfoCards,
  onBack,
  onOpenChat,
  onOpenPatients,
}) {
  return (
    <View style={styles.homeContainer}>
      <TopBar title="Sobre o Assistente" backTo="ChatBot" colors={colors} styles={styles} onBack={onBack} />
      <ScrollView style={styles.homeScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatInfoScrollContent}>
        <View style={styles.chatInfoHeroCard}>
          <View style={styles.chatInfoHeroOrbLarge} />
          <View style={styles.chatInfoHeroOrbSmall} />
          <View style={styles.chatInfoBadge}>
            <Text style={styles.chatInfoBadgeText}>Versão beta</Text>
          </View>
          <Text style={styles.chatInfoHeroTitle}>Bem-vindo ao Assistente Heal+</Text>
          <Text style={styles.chatInfoHeroText}>
            Uma assistente local para consultar o banco do app com agilidade, sem custo por token e sem depender de serviços externos.
          </Text>
        </View>
        <Text style={styles.chatInfoSectionTitle}>Como funciona</Text>
        <View style={styles.chatInfoCardsGrid}>
          {chatInfoCards.map(card => (
            <View key={card.id} style={styles.chatInfoCard}>
              <View style={styles.chatInfoIconWrap}>
                <Ionicons name={card.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.chatInfoCardTitle}>{card.title}</Text>
              <Text style={styles.chatInfoCardText}>{card.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chatInfoNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.chatInfoNoticeText}>
            As respostas são montadas a partir do banco local e podem conter imprecisões. Sempre confirme informações importantes antes de tomar decisões clínicas.
          </Text>
        </View>
        <View style={styles.chatInfoDivider} />
        <Text style={styles.chatInfoSectionTitle}>Precisa de outro caminho?</Text>
        <Text style={styles.chatInfoSupportText}>
          Você pode voltar ao assistente para fazer uma nova pergunta agora ou abrir a lista de pacientes para conferir os dados manualmente.
        </Text>
        <TouchableOpacity style={styles.chatInfoPrimaryButton} onPress={onOpenChat}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFF" />
          <Text style={styles.chatInfoPrimaryButtonText}>Voltar ao assistente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatInfoSecondaryButton} onPress={onOpenPatients}>
          <Ionicons name="people-outline" size={18} color={colors.primary} />
          <Text style={styles.chatInfoSecondaryButtonText}>Ver pacientes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
