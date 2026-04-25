import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ModalSheet from './ModalSheet';

export default function SelectionListModal({
  visible,
  onClose,
  styles,
  colors,
  title,
  items,
  emptyTitle,
  emptyText,
  getKey,
  getTitle,
  getSubtitle,
  onSelect,
}) {
  return (
    <ModalSheet
      visible={visible}
      onRequestClose={onClose}
      styles={styles}
      colors={colors}
      title={title}
      contentStyle={{ maxHeight: '70%' }}
    >
      {!items.length ? (
        <View style={styles.emptyStateCard}>
          <Ionicons
            name="document-text-outline"
            size={42}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyStateTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyStateText}>{emptyText}</Text>
        </View>
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
        >
          {items.map(item => (
            <TouchableOpacity
              key={getKey(item)}
              style={styles.modalListItem}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.modalListTitle}>{getTitle(item)}</Text>
              {!!getSubtitle && (
                <Text style={styles.modalListSubtitle}>{getSubtitle(item)}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ModalSheet>
  );
}
