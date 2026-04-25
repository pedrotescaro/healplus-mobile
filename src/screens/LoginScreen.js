import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LOGO_IMAGE } from '../constants/appConstants';

export default function LoginScreen({
  styles,
  colors,
  userName,
  userPhoto,
  previewUserEmail,
  showUserPhotoPreview,
  password,
  setPassword,
  isError,
  isFocused,
  showPassword,
  setShowPassword,
  activity,
  isLoginButtonDisabled,
  labelStyle,
  onFocus,
  onBlur,
  onLogin,
  onForgotPassword,
  onSwitchAccount,
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerFixoLogin}>
        <Image style={styles.logo} source={LOGO_IMAGE} resizeMode="contain" />
        <Text style={styles.logoText}>
          Heal<Text style={styles.textBlue}>+</Text>
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.telaWrapper}>
          <View style={styles.placeholderTitle} />
          <View style={styles.userCard}>
            <View style={[styles.avatar, { overflow: 'hidden' }]}>
              {showUserPhotoPreview ? (
                <Image source={{ uri: userPhoto }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.avatarText}>
                  {userName
                    .split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userId}>{previewUserEmail}</Text>
            </View>
            <TouchableOpacity style={styles.btnTrocar} onPress={onSwitchAccount}>
              <Text style={styles.btnTrocarText}>Trocar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: isError ? '#EF4444' : isFocused ? colors.text : colors.border },
              ]}
            >
              <Animated.Text style={labelStyle}>Senha</Animated.Text>
              <TextInput
                style={[styles.input, { color: colors.text }, (isFocused || password) && { paddingTop: 18 }]}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                }}
                secureTextEntry={!showPassword}
                onFocus={onFocus}
                onBlur={onBlur}
                autoCapitalize="none"
              />
              {password.length > 0 && (
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => setPassword('')} style={styles.iconButton}>
                    <Ionicons name="close-circle-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnEntrar, !activity && isLoginButtonDisabled && styles.loginButtonDisabled]}
            onPress={onLogin}
            disabled={activity || isLoginButtonDisabled}
          >
            {activity ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.btnEntrarText, isLoginButtonDisabled && styles.loginButtonTextDisabled]}>
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnEsqueci} onPress={onForgotPassword}>
            <Text style={styles.btnEsqueciText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Ao clicar em continuar, você concorda com nossos{`\n`}
            <Text style={styles.footerLink}>Termos de Serviço</Text> e{' '}
            <Text style={styles.footerLink}>Política de Privacidade</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}
