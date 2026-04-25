import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ModalSheet from './ModalSheet';

export default function ProfilePhotoPickerModal({
  visible,
  onClose,
  styles,
  colors,
  isBusy,
  hasPhoto,
  onTakePhoto,
  onChooseFromLibrary,
  onRemovePhoto,
}) {
  return (
    <ModalSheet
      visible={visible}
      onRequestClose={onClose}
      styles={styles}
      colors={colors}
      title="Foto do Perfil"
      closeDisabled={isBusy}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          marginBottom: 25,
          textAlign: 'center',
        }}
      >
        Escolha como deseja atualizar a foto do profissional
      </Text>

      <TouchableOpacity
        style={[styles.imagePickerOption, isBusy && { opacity: 0.7 }]}
        onPress={onTakePhoto}
        disabled={isBusy}
      >
        <View
          style={[
            styles.imagePickerIconBox,
            { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
          ]}
        >
          <Ionicons name="camera" size={28} color="#3B82F6" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Tirar Foto
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}
          >
            Abrir a câmera do dispositivo
          </Text>
        </View>
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.border}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.imagePickerOption, isBusy && { opacity: 0.7 }]}
        onPress={onChooseFromLibrary}
        disabled={isBusy}
      >
        <View
          style={[
            styles.imagePickerIconBox,
            { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
          ]}
        >
          <Ionicons name="images" size={28} color="#8B5CF6" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Escolher da Galeria
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}
          >
            Selecionar um arquivo existente
          </Text>
        </View>
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.border}
          />
        )}
      </TouchableOpacity>

      {hasPhoto && (
        <TouchableOpacity
          style={[styles.imagePickerOption, isBusy && { opacity: 0.7 }]}
          onPress={onRemovePhoto}
          disabled={isBusy}
        >
          <View
            style={[
              styles.imagePickerIconBox,
              { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
            ]}
          >
            <Ionicons name="trash" size={28} color="#EF4444" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              Remover Foto
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}
            >
              Voltar para as iniciais do profissional
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.border} />
        </TouchableOpacity>
      )}

      <View style={{ height: 20 }} />
    </ModalSheet>
  );
}
