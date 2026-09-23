/**
 * Safely triggers browser file downloads from Blob or text content.
 * Prevents premature URL.revokeObjectURL race condition in Chrome/Chromium.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Safely delay revocation so the browser download manager can finish reading the stream
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error
    }
  }, 4000);
}

/**
 * Downloads plain text or CSV content with UTF-8 BOM
 */
export function downloadText(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}
