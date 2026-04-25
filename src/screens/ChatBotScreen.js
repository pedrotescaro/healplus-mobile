import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatBotScreen({
  styles,
  colors,
  platformBehavior,
  chatScrollRef,
  messages,
  isAiTyping,
  userName,
  chatQuickTopics,
  chatMessage,
  setChatMessage,
  onBackHome,
  onOpenInfo,
  onSendChat,
}) {
  return (
    <KeyboardAvoidingView style={styles.chatContainer} behavior={platformBehavior}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBackHome} style={styles.btnVoltarChat}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnInfoChat} onPress={onOpenInfo}>
          <Ionicons name="information-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={chatScrollRef}
        style={styles.chatContent}
        contentContainerStyle={messages.length === 0 ? styles.chatContentEmpty : styles.chatContentFilled}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.chatEmptyState}>
            <Text style={styles.chatGreeting}>Oi, {userName.split(' ')[0]}. O que voce quer pesquisar?</Text>
            <Text style={styles.chatGreetingSubtext}>
              Posso consultar pacientes, avaliacoes e agenda usando so o banco local do Heal+.
            </Text>
            <View style={styles.chatSuggestionsRow}>
              <TouchableOpacity style={styles.chatSuggestionCard} onPress={() => onSendChat('Quantos pacientes ativos eu tenho?')}>
                <Text style={styles.chatSuggestionTitle}>Como voce pode me ajudar?</Text>
                <Text style={styles.chatSuggestionText}>Entenda o que consigo consultar no banco local.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatSuggestionCard} onPress={() => onSendChat('Quais atendimentos eu tenho hoje?')}>
                <Text style={styles.chatSuggestionTitle}>Resumo do meu dia</Text>
                <Text style={styles.chatSuggestionText}>Veja retornos e atendimentos ja salvos no app.</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.chatMessagesWrap}>
            {messages.map(message => (
              <View key={message.id} style={message.sender === 'user' ? styles.msgUser : styles.msgAi}>
                <Text style={message.sender === 'user' ? styles.msgUserText : styles.msgAiText}>{message.text}</Text>
              </View>
            ))}
            {isAiTyping ? (
              <View style={styles.msgAi}>
                <Text style={[styles.msgAiText, { color: colors.textSecondary }]}>Consultando banco local...</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chatTopicRow}>
          {chatQuickTopics.map(topic => (
            <TouchableOpacity key={topic.id} style={styles.chatTopicChip} onPress={() => onSendChat(topic.prompt)}>
              <Text style={styles.chatTopicChipText}>{topic.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.chatInputBoxImageStyle}>
          <TextInput
            style={styles.chatInputField}
            value={chatMessage}
            onChangeText={setChatMessage}
            placeholder="Pesquise no banco local do Heal+"
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={() => onSendChat()}
          />
          <TouchableOpacity
            onPress={() => onSendChat()}
            style={[styles.btnSendChatIcon, chatMessage.length === 0 && { opacity: 0.5 }]}
            disabled={chatMessage.length === 0}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.chatDisclaimer}>
          Voce esta conversando com uma IA local. As respostas podem conter erros. Sempre confira.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
