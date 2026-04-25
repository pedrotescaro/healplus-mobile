import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const getBlockedImagePermissionMessage = permissionName =>
  Platform.OS === 'ios'
    ? `O acesso ${permissionName} esta bloqueado para o Heal+. Abra Ajustes do iPhone > Heal+ e libere a permissao para continuar.`
    : `O acesso ${permissionName} esta bloqueado para o Heal+. Abra as configuracoes do app e libere a permissao para continuar.`;

export const buildCameraPickerOptions = aspect => ({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect,
  quality: 0.8,
  ...(Platform.OS === 'ios'
    ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }
    : {}),
});

export const buildLibraryPickerOptions = aspect => ({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect,
  quality: 0.8,
  ...(Platform.OS === 'ios'
    ? {
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        shouldDownloadFromNetwork: true,
      }
    : {}),
});

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
        'Permissao necessaria',
        permission?.canAskAgain === false
          ? getBlockedImagePermissionMessage(blockedPermissionName)
          : permissionDeniedMessage
      );
      return;
    }

    const result = await launchPicker();
    if (result?.canceled) return;

    const nextUri = result?.assets?.[0]?.uri;
    if (!nextUri) {
      Alert.alert(
        'Imagem indisponivel',
        'A foto foi selecionada, mas o arquivo nao ficou disponivel para o app. Tente novamente.'
      );
      return;
    }

    onPick(nextUri);
  } catch (error) {
    console.warn(`[image-picker] Falha ao ${errorActionLabel}`, error);
    Alert.alert(
      'Nao foi possivel abrir a imagem',
      `O app nao conseguiu ${errorActionLabel} agora. Feche e tente novamente.`
    );
  } finally {
    if (afterFinish) afterFinish();
  }
}
