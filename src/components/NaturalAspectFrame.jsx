import React, { useEffect, useState } from "react";
import { aspectRatioFromDimensions, normalizeAspectRatio, toCssAspectRatio } from "../lib/aspectRatio";

const NaturalAspectFrame = ({
  src,
  alt,
  fallbackAspectRatio = "1:1",
  className = "",
  imageClassName = "",
  children,
  loading,
}) => {
  const [resolvedAspectRatio, setResolvedAspectRatio] = useState(
    normalizeAspectRatio(fallbackAspectRatio),
  );

  useEffect(() => {
    setResolvedAspectRatio(normalizeAspectRatio(fallbackAspectRatio));
  }, [src, fallbackAspectRatio]);

  const handleLoad = event => {
    setResolvedAspectRatio(aspectRatioFromDimensions(
      event.currentTarget.naturalWidth,
      event.currentTarget.naturalHeight,
      fallbackAspectRatio,
    ));
  };

  return (
    <div className={className} style={{ aspectRatio: toCssAspectRatio(resolvedAspectRatio) }}>
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
      />
      {children}
    </div>
  );
};

export default NaturalAspectFrame;
