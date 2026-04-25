import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav({
  colors,
  styles,
  navItems,
  activeBottomTabKey,
  activeBottomTabIndex,
  bottomNavWidth,
  setBottomNavWidth,
  bottomNavTranslate,
  bottomNavScale,
  androidBottomInset,
}) {
  const shouldRenderAndroidNavSpacer = androidBottomInset > 0.5;

  return (
    <View style={styles.bottomNavShell}>
      <View
        style={styles.bottomNavBar}
        onLayout={({ nativeEvent }) => {
          const nextWidth = nativeEvent.layout.width;
          setBottomNavWidth(currentWidth =>
            Math.abs(currentWidth - nextWidth) > 0.5 ? nextWidth : currentWidth
          );
        }}
      >
        {bottomNavWidth > 0 && activeBottomTabIndex >= 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.navActiveIndicatorSlider,
              {
                transform: [{ translateX: bottomNavTranslate }, { scaleX: bottomNavScale }],
              },
            ]}
          />
        ) : null}

        {navItems.map(item => {
          const isActive = activeBottomTabKey === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={item.onPress}
              activeOpacity={0.88}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.inactiveIcon}
                size={26}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navItemText, { color: isActive ? colors.primary : colors.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {shouldRenderAndroidNavSpacer ? (
        <View style={[styles.bottomNavAndroidSpacer, { height: androidBottomInset }]} />
      ) : null}
    </View>
  );
}
