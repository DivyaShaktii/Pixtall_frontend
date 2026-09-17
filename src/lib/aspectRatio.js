const DEFAULT_ASPECT_RATIO = "1:1";
const ASPECT_RATIO_PATTERN = /^(\d+):(\d+)$/;

export const normalizeAspectRatio = value => {
  const match = String(value || "").match(ASPECT_RATIO_PATTERN);
  if (!match) return DEFAULT_ASPECT_RATIO;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return DEFAULT_ASPECT_RATIO;

  return `${width}:${height}`;
};

export const toCssAspectRatio = value => (
  normalizeAspectRatio(value).replace(":", " / ")
);

export const aspectRatioFromDimensions = (width, height, fallback = DEFAULT_ASPECT_RATIO) => {
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if (!Number.isFinite(numericWidth) || !Number.isFinite(numericHeight) || numericWidth <= 0 || numericHeight <= 0) {
    return normalizeAspectRatio(fallback);
  }

  return `${numericWidth}:${numericHeight}`;
};
