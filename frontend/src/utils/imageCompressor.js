/**
 * Client-side image compression and thumbnail generation
 * for X-rays, tomography scans, and clinical documents.
 */

/**
 * Compresses an image file using an offscreen canvas.
 * @param {File|Blob} file
 * @param {Object} options
 * @param {number} options.maxWidth
 * @param {number} options.maxHeight
 * @param {number} options.quality (0.0 to 1.0)
 * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number, size: number}>}
 */
export async function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({
              blob,
              dataUrl,
              width,
              height,
              size: blob.size,
              originalSize: file.size
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a fast, lightweight thumbnail specifically for list views (e.g. 120x120 max).
 * @param {File|Blob} file
 * @returns {Promise<string>} dataUrl of the thumbnail
 */
export async function createThumbnail(file, size = 120) {
  const result = await compressImage(file, { maxWidth: size, maxHeight: size, quality: 0.65 });
  return result.dataUrl;
}
