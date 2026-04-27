import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Polyline } from 'react-native-svg';

const clamp01 = value => Math.min(Math.max(Number(value) || 0, 0), 1);
const ROI_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export const normalizeRoiPoints = points =>
  Array.isArray(points)
    ? points
        .map(point => ({
          x: clamp01(point?.x),
          y: clamp01(point?.y),
        }))
        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];

export const hasValidRoi = points => normalizeRoiPoints(points).length >= 3;

export const normalizeRois = rois =>
  Array.isArray(rois)
    ? rois
        .map((roi, index) => {
          const points = normalizeRoiPoints(roi?.points);
          return {
            id: roi?.id || `roi-${index + 1}`,
            label: roi?.label || `ROI ${index + 1}`,
            mode: roi?.mode === 'pen' ? 'pen' : 'points',
            color: roi?.color || ROI_COLORS[index % ROI_COLORS.length],
            points,
            roiImageUri: roi?.roiImageUri || '',
            roiImageBase64: roi?.roiImageBase64 || '',
          };
        })
        .filter(roi => roi.points.length > 0)
    : [];

export const hasValidRois = rois => normalizeRois(rois).some(roi => roi.points.length >= 3);

export const roiPointsToSvgPoints = points =>
  normalizeRoiPoints(points)
    .map(point => `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`)
    .join(' ');

export default function RoiImageOverlay({
  rois,
  roi,
  points,
  color = '#10B981',
  fillColor = 'rgba(16, 185, 129, 0.18)',
  style,
  showPoints = true,
}) {
  let normalizedRois = rois
    ? normalizeRois(rois)
    : roi
      ? normalizeRois([roi])
      : normalizeRois([{ id: 'legacy-roi', label: 'ROI 1', mode: 'points', color, points }]);

  if (!normalizedRois.length && points) {
    normalizedRois = normalizeRois([{ id: 'legacy-roi', label: 'ROI 1', mode: 'points', color, points }]);
  }

  if (!normalizedRois.length) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {normalizedRois.map((currentRoi, roiIndex) => {
          const svgPoints = roiPointsToSvgPoints(currentRoi.points);
          const isPen = currentRoi.mode === 'pen';
          const roiColor = currentRoi.color || color;
          const roiFill = isPen ? 'rgba(59, 130, 246, 0.1)' : fillColor;

          return (
            <React.Fragment key={currentRoi.id || `${currentRoi.label}-${roiIndex}`}>
              {currentRoi.points.length >= 3 ? (
                <Polygon
                  points={svgPoints}
                  fill={roiFill}
                  stroke={roiColor}
                  strokeWidth={isPen ? '5' : '7'}
                />
              ) : null}
              <Polyline
                points={svgPoints}
                fill="none"
                stroke={roiColor}
                strokeWidth={isPen ? '5' : '7'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showPoints && !isPen
                ? currentRoi.points.map((point, index) => (
                    <Circle
                      key={`${currentRoi.id}-${index}-${point.x}-${point.y}`}
                      cx={point.x * 1000}
                      cy={point.y * 1000}
                      r="10"
                      fill="#FFFFFF"
                      stroke={roiColor}
                      strokeWidth="5"
                    />
                  ))
                : null}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
