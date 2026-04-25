import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LOGO_IMAGE } from '../../constants/appConstants';

export default function HeaderDashboard({
  colors,
  styles,
  onOpenProfile,
  onOpenNotifications,
  showUserPhotoPreview,
  userPhoto,
  userName,
}) {
  return (
    <View style={styles.homeHeaderFixo}>
      <View style={styles.headerBrandRow}>
        <Image style={styles.headerLogo} source={LOGO_IMAGE} resizeMode="contain" />
        <Text style={styles.headerLogoText}>
          Heal<Text style={styles.textBlue}>+</Text>
        </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onOpenProfile} style={[styles.headerAvatar, { overflow: 'hidden' }]}>
          {showUserPhotoPreview ? (
            <Image source={{ uri: userPhoto }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={styles.headerAvatarText}>
              {userName
                .split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
