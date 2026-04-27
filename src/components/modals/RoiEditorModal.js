import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Modal, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import RoiImageOverlay, { hasValidRois, normalizeRoiPoints, normalizeRois } from '../common/RoiImageOverlay';

const ROI_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
const POINT_MIN_DISTANCE = 0.035;
const PEN_MIN_DISTANCE = 0.006;

const createRoi = index => ({
  id: `roi-${Date.now()}-${index + 1}`,
  label: `ROI ${index + 1}`,
  mode: 'pen',
  color: ROI_COLORS[index % ROI_COLORS.length],
  points: [],
});

const getDistance = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function RoiEditorModal({
  visible,
  imageUri,
  initialRois,
  initialPoints,
  colors,
  styles,
  onCancel,
  onConfirm,
}) {
  const [draftRois, setDraftRois] = useState([]);
  const [selectedRoiId, setSelectedRoiId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const selectedRoi = draftRois.find(roi => roi.id === selectedRoiId) || draftRois[0] || null;
  const canConfirm = hasValidRois(draftRois);

  useEffect(() => {
    if (!visible) return;

    const normalizedRois = normalizeRois(initialRois);
    const legacyPoints = normalizeRoiPoints(initialPoints);
    const nextRois = normalizedRois.length
      ? normalizedRois
      : legacyPoints.length
        ? [{ ...createRoi(0), mode: 'points', points: legacyPoints }]
        : [createRoi(0)];

    setDraftRois(nextRois);
    setSelectedRoiId(nextRois[0]?.id || null);
  }, [initialPoints, initialRois, visible]);

  const updateSelectedRoi = useCallback((updater) => {
    setDraftRois(currentRois =>
      currentRois.map(roi => (roi.id === selectedRoiId ? updater(roi) : roi))
    );
  }, [selectedRoiId]);

  const addPointFromEvent = useCallback(
    event => {
      if (!canvasSize.width || !canvasSize.height || !selectedRoiId) return;

      const { locationX, locationY } = event.nativeEvent;
      const nextPoint = {
        x: Math.min(Math.max(locationX / canvasSize.width, 0), 1),
        y: Math.min(Math.max(locationY / canvasSize.height, 0), 1),
      };

      updateSelectedRoi(roi => {
        const lastPoint = roi.points[roi.points.length - 1];
        const minDistance = roi.mode === 'pen' ? PEN_MIN_DISTANCE : POINT_MIN_DISTANCE;

        if (lastPoint && getDistance(lastPoint, nextPoint) < minDistance) {
          return roi;
        }

        return { ...roi, points: [...roi.points, nextPoint] };
      });
    },
    [canvasSize.height, canvasSize.width, selectedRoiId, updateSelectedRoi]
  );

  const addPointIfPen = useCallback(
    event => {
      if (selectedRoi?.mode !== 'pen') return;
      addPointFromEvent(event);
    },
    [addPointFromEvent, selectedRoi?.mode]
  );

  const stageResponder = useMemo(
    () => ({
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => selectedRoi?.mode === 'pen',
      onResponderGrant: addPointFromEvent,
      onResponderMove: addPointIfPen,
    }),
    [addPointFromEvent, addPointIfPen, selectedRoi?.mode]
  );

  const addNewRoi = () => {
    const nextRoi = createRoi(draftRois.length);
    setDraftRois(currentRois => [...currentRois, nextRoi]);
    setSelectedRoiId(nextRoi.id);
  };

  const removeSelectedRoi = () => {
    if (!selectedRoi) return;

    setDraftRois(currentRois => {
      const nextRois = currentRois.filter(roi => roi.id !== selectedRoi.id);
      const fallbackRois = nextRois.length ? nextRois : [createRoi(0)];
      setSelectedRoiId(fallbackRois[0].id);
      return fallbackRois;
    });
  };

  const clearSelectedRoi = () => {
    updateSelectedRoi(roi => ({ ...roi, points: [] }));
  };

  const clearAllRois = () => {
    const nextRoi = createRoi(0);
    setDraftRois([nextRoi]);
    setSelectedRoiId(nextRoi.id);
  };

  const setSelectedMode = mode => {
    updateSelectedRoi(roi => ({ ...roi, mode }));
  };

  const handleConfirm = () => {
    onConfirm(
      draftRois
        .map((roi, index) => ({
          ...roi,
          label: roi.label || `ROI ${index + 1}`,
          points: normalizeRoiPoints(roi.points),
        }))
        .filter(roi => roi.points.length >= 3)
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onCancel}>
      <SafeAreaView style={styles.roiEditorScreen}>
        <View style={styles.roiEditorHeader}>
          <TouchableOpacity style={styles.roiHeaderButton} onPress={onCancel}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.roiHeaderButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.roiEditorTitle}>Delimitar ROI</Text>
          <TouchableOpacity style={styles.roiHeaderButton} onPress={clearSelectedRoi}>
            <Ionicons name="refresh" size={22} color={colors.primary} />
            <Text style={[styles.roiHeaderButtonText, { color: colors.primary }]}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.roiEditorBody}
          contentContainerStyle={styles.roiEditorBodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={styles.roiImageStage}
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              setCanvasSize({ width, height });
            }}
            {...stageResponder}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.roiEditorImage} resizeMode="contain" />
            ) : null}
            <RoiImageOverlay rois={draftRois} fillColor="rgba(59, 130, 246, 0.12)" />
          </View>

          <View style={styles.roiModeRow}>
            <TouchableOpacity
              style={[styles.roiModeButton, selectedRoi?.mode === 'points' && styles.roiModeButtonActive]}
              onPress={() => setSelectedMode('points')}
            >
              <Ionicons name="radio-button-on-outline" size={17} color={selectedRoi?.mode === 'points' ? '#FFF' : colors.primary} />
              <Text style={[styles.roiModeButtonText, selectedRoi?.mode === 'points' && styles.roiModeButtonTextActive]}>
                Pontos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roiModeButton, selectedRoi?.mode === 'pen' && styles.roiModeButtonActive]}
              onPress={() => setSelectedMode('pen')}
            >
              <Ionicons name="brush-outline" size={17} color={selectedRoi?.mode === 'pen' ? '#FFF' : colors.primary} />
              <Text style={[styles.roiModeButtonText, selectedRoi?.mode === 'pen' && styles.roiModeButtonTextActive]}>
                Caneta fina
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roiEditorHintCard}>
            <Ionicons name="finger-print-outline" size={22} color={selectedRoi?.color || colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.roiEditorHintTitle}>
                {selectedRoi?.label || 'ROI'} • {selectedRoi?.mode === 'pen' ? 'Caneta fina' : 'Pontos'}
              </Text>
              <Text style={styles.roiEditorHintText}>
                {selectedRoi?.mode === 'pen'
                  ? 'Arraste o dedo para desenhar uma linha fina e contínua ao redor da ferida.'
                  : 'Toque em pontos ao redor da ferida para formar o contorno.'}
              </Text>
            </View>
          </View>

          <View style={styles.roiPreviewRow}>
            <View style={styles.roiPreviewPill}>
              <Ionicons
                name={canConfirm ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={canConfirm ? '#10B981' : colors.textSecondary}
              />
              <Text style={styles.roiPreviewText}>
                {canConfirm ? `${draftRois.filter(roi => roi.points.length >= 3).length} ROI(s) salvas` : 'Marque ao menos 3 pontos'}
              </Text>
            </View>
            <TouchableOpacity style={styles.roiAddButton} onPress={addNewRoi}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.roiAddButtonText}>Adicionar ROI</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roiListScroll}>
            {draftRois.map((roi, index) => {
              const isSelected = roi.id === selectedRoiId;
              return (
                <TouchableOpacity
                  key={roi.id}
                  style={[styles.roiChip, isSelected && { borderColor: roi.color, backgroundColor: `${roi.color}22` }]}
                  onPress={() => setSelectedRoiId(roi.id)}
                >
                  <View style={[styles.roiChipDot, { backgroundColor: roi.color }]} />
                  <Text style={styles.roiChipText}>{roi.label || `ROI ${index + 1}`}</Text>
                  <Text style={styles.roiChipCount}>{roi.points.length}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.roiSmallActionsRow}>
            <TouchableOpacity style={styles.roiSmallActionButton} onPress={removeSelectedRoi}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.roiSmallActionText, { color: '#EF4444' }]}>Excluir ROI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roiSmallActionButton} onPress={clearAllRois}>
              <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roiSmallActionText}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.roiEditorFooter, Platform.OS === 'android' && { paddingBottom: 42 }]}>
          <TouchableOpacity style={styles.roiSecondaryButton} onPress={onCancel}>
            <Text style={styles.roiSecondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roiPrimaryButton, !canConfirm && { opacity: 0.5 }]}
            onPress={handleConfirm}
            disabled={!canConfirm}
          >
            <Text style={styles.roiPrimaryButtonText}>Confirmar ROI</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
