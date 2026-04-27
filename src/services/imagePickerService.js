import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const getBlockedImagePermissionMessage = permissionName =>
  Platform.OS === 'ios'
    ? `O acesso ${permissionName} está bloqueado para o Heal+. Abra Ajustes do iPhone > Heal+ e libere a permissão para continuar.`
    : `O acesso ${permissionName} está bloqueado para o Heal+. Abra as configurações do app e libere a permissão para continuar.`;

export const buildCameraPickerOptions = (aspect, options = {}) => {
  const allowsEditing = options.allowsEditing ?? true;
  return {
  mediaTypes: ['images'],
  allowsEditing,
  ...(allowsEditing && aspect ? { aspect } : {}),
  quality: 0.8,
  base64: true,
  ...(Platform.OS === 'ios'
    ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }
    : {}),
  };
};

export const buildLibraryPickerOptions = (aspect, options = {}) => {
  const allowsEditing = options.allowsEditing ?? true;
  return {
  mediaTypes: ['images'],
  allowsEditing,
  ...(allowsEditing && aspect ? { aspect } : {}),
  quality: 0.8,
  base64: true,
  ...(Platform.OS === 'ios'
    ? {
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        shouldDownloadFromNetwork: true,
      }
    : {}),
  };
};

export async function executeImageFlow({
  requestPermission,
  permissionDeniedMessage,
  blockedPermissionName,
  launchPicker,
  errorActionLabel,
  onPick,
  beforeStart,
  afterFinish,
}) {
  if (beforeStart) beforeStart();

  try {
    const permission = await requestPermission();
    const permissionGranted = permission?.granted ?? permission?.status === 'granted';

    if (!permissionGranted) {
      Alert.alert(
        'Permissão necessária',
        permission?.canAskAgain === false
          ? getBlockedImagePermissionMessage(blockedPermissionName)
          : permissionDeniedMessage
      );
      return;
    }

    const result = await launchPicker();
    if (result?.canceled) return;

    const pickedAsset = result?.assets?.[0];
    const nextUri = pickedAsset?.uri;
    if (!nextUri) {
      Alert.alert(
        'Imagem indisponível',
        'A foto foi selecionada, mas o arquivo não ficou disponível para o app. Tente novamente.'
      );
      return;
    }

    onPick(nextUri, pickedAsset);
  } catch (error) {
    console.warn(`[image-picker] Falha ao ${errorActionLabel}`, error);
    Alert.alert(
      'Não foi possível abrir a imagem',
      `O app não conseguiu ${errorActionLabel} agora. Feche e tente novamente.`
    );
  } finally {
    if (afterFinish) afterFinish();
  }
}
