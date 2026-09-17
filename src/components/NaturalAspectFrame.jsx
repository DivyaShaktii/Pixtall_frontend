import React, { useEffect, useRef, useState } from "react";
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
  const imageRef = useRef(null);
  const [resolvedAspectRatio, setResolvedAspectRatio] = useState(
    normalizeAspectRatio(fallbackAspectRatio),
  );

  useEffect(() => {
    const image = imageRef.current;
    setResolvedAspectRatio(aspectRatioFromDimensions(
      image?.complete ? image.naturalWidth : 0,
      image?.complete ? image.naturalHeight : 0,
      fallbackAspectRatio,
    ));
  }, [src, fallbackAspectRatio]);

  const handleLoad = event => {
    setResolvedAspectRatio(aspectRatioFromDimensions(
      event.currentTarget.naturalWidth,
      event.currentTarget.naturalHeight,
      fallbackAspectRatio,
    ));
  };

  return (
    <div className={className} style={{ position: "relative", aspectRatio: toCssAspectRatio(resolvedAspectRatio) }}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={imageClassName}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
      />
      {children}
    </div>
  );
};

export default NaturalAspectFrame;
