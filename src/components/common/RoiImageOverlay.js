import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Polyline } from 'react-native-svg';

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

export const getContainedImageFrame = (containerWidth, containerHeight, imageWidth, imageHeight) => {
  const width = Number(containerWidth) || 0;
  const height = Number(containerHeight) || 0;
  const sourceWidth = Number(imageWidth) || 0;
  const sourceHeight = Number(imageHeight) || 0;

  if (!width || !height || !sourceWidth || !sourceHeight) {
    return { x: 0, y: 0, width, height };
  }

  const containerRatio = width / height;
  const imageRatio = sourceWidth / sourceHeight;

  if (imageRatio > containerRatio) {
    const fittedHeight = width / imageRatio;
    return { x: 0, y: (height - fittedHeight) / 2, width, height: fittedHeight };
  }

  const fittedWidth = height * imageRatio;
  return { x: (width - fittedWidth) / 2, y: 0, width: fittedWidth, height };
};

export const roiPointsToSmoothPath = points => {
  const normalizedPoints = normalizeRoiPoints(points);
  if (!normalizedPoints.length) return '';

  const scaledPoints = normalizedPoints.map(point => ({
    x: Math.round(point.x * 1000),
    y: Math.round(point.y * 1000),
  }));

  if (scaledPoints.length === 1) {
    return `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  }

  if (scaledPoints.length === 2) {
    return `M ${scaledPoints[0].x} ${scaledPoints[0].y} L ${scaledPoints[1].x} ${scaledPoints[1].y}`;
  }

  let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  for (let index = 1; index < scaledPoints.length - 1; index += 1) {
    const current = scaledPoints[index];
    const next = scaledPoints[index + 1];
    const midX = Math.round((current.x + next.x) / 2);
    const midY = Math.round((current.y + next.y) / 2);
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  const last = scaledPoints[scaledPoints.length - 1];
  return `${path} L ${last.x} ${last.y}`;
};

export default function RoiImageOverlay({
  rois,
  roi,
  points,
  color = '#10B981',
  fillColor = 'rgba(16, 185, 129, 0.18)',
  style,
  showPoints = true,
  imageWidth,
  imageHeight,
}) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  let normalizedRois = rois
    ? normalizeRois(rois)
    : roi
      ? normalizeRois([roi])
      : normalizeRois([{ id: 'legacy-roi', label: 'ROI 1', mode: 'points', color, points }]);

  if (!normalizedRois.length && points) {
    normalizedRois = normalizeRois([{ id: 'legacy-roi', label: 'ROI 1', mode: 'points', color, points }]);
  }

  const overlayFrame = useMemo(
    () => getContainedImageFrame(containerSize.width, containerSize.height, imageWidth, imageHeight),
    [containerSize.height, containerSize.width, imageHeight, imageWidth]
  );

  if (!normalizedRois.length) return null;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      <View
        pointerEvents="none"
        style={[
          styles.overlayFrame,
          {
            left: overlayFrame.x,
            top: overlayFrame.y,
            width: overlayFrame.width,
            height: overlayFrame.height,
          },
        ]}
      >
      <Svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {normalizedRois.map((currentRoi, roiIndex) => {
          const svgPoints = roiPointsToSvgPoints(currentRoi.points);
          const smoothPath = roiPointsToSmoothPath(currentRoi.points);
          const isPen = currentRoi.mode === 'pen';
          const roiColor = currentRoi.color || color;
          const roiFill = isPen ? 'rgba(59, 130, 246, 0.1)' : fillColor;

          return (
            <React.Fragment key={currentRoi.id || `${currentRoi.label}-${roiIndex}`}>
              {currentRoi.points.length >= 3 && !isPen ? (
                <Polygon
                  points={svgPoints}
                  fill={roiFill}
                  stroke={roiColor}
                  strokeWidth="7"
                />
              ) : null}
              {isPen ? (
                <Path
                  d={smoothPath}
                  fill="none"
                  stroke={roiColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <Polyline
                  points={svgPoints}
                  fill="none"
                  stroke={roiColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlayFrame: {
    position: 'absolute',
  },
});
