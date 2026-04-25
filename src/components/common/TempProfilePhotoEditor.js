import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TempProfilePhotoEditor({
  colors,
  styles,
  tempPhoto,
  tempName,
  isImagePickerBusy,
  onOpenPicker,
  onRemovePhoto,
}) {
  return (
    <View style={styles.profilePhotoEditorBlock}>
      <TouchableOpacity
        style={[
          styles.avatarLarge,
          styles.editableAvatarButton,
          { overflow: 'hidden' },
          isImagePickerBusy && { opacity: 0.7 },
        ]}
        onPress={onOpenPicker}
        disabled={isImagePickerBusy}
      >
        {tempPhoto ? (
          <Image source={{ uri: tempPhoto }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={styles.avatarTextLarge}>
            {tempName
              .split(' ')
              .map(name => name[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </Text>
        )}
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={14} color="#FFF" />
        </View>
      </TouchableOpacity>
      <Text style={styles.profilePhotoHint}>
        Toque na foto para tirar uma imagem nova ou escolher da galeria.
      </Text>
      <View style={styles.profilePhotoActionsRow}>
        <TouchableOpacity
          style={[styles.profilePhotoActionBtn, isImagePickerBusy && { opacity: 0.7 }]}
          onPress={onOpenPicker}
          disabled={isImagePickerBusy}
        >
          <Ionicons name="images-outline" size={16} color={colors.primary} />
          <Text style={styles.profilePhotoActionText}>
            {tempPhoto ? 'Trocar foto' : 'Adicionar foto'}
          </Text>
        </TouchableOpacity>
        {!!tempPhoto && (
          <TouchableOpacity
            style={[
              styles.profilePhotoActionBtn,
              styles.profilePhotoRemoveBtn,
              isImagePickerBusy && { opacity: 0.7 },
            ]}
            onPress={onRemovePhoto}
            disabled={isImagePickerBusy}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.profilePhotoRemoveText}>Remover</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
