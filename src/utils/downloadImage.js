/**
 * Triggers a browser download for a given image source (data URL or
 * regular URL) under the given filename. Shared by anywhere in the app
 * that offers a "download this image" button.
 */
export const downloadImage = (src, filename) => {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};