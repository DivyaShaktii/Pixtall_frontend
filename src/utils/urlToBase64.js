export const urlToBase64 = async imageUrl => {
  // Already a data URL (user-uploaded image) — return as-is
  if (typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Could not load model image (${response.status})`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(blob);
  });
};
