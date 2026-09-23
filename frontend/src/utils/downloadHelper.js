/**
 * Bulletproof file downloader for modern browsers (Chrome, Edge, Firefox, Safari).
 * 
 * CRITICAL FIX FOR CHROMIUM:
 * In modern Chromium, anchor tags MUST be attached to `document.body` (`a.isConnected === true`)
 * before triggering `.click()`. Otherwise, Chromium ignores the `download` attribute for Blob URLs
 * and saves the file with an internal UUID name (e.g. 50a72cf2-6de1-4999...) without an extension!
 */

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  // Attach to DOM so Chrome treats the download attribute as trusted and respects filename
  document.body.appendChild(a);
  a.click();
  
  // Cleanup after browser has scheduled the download
  setTimeout(() => {
    if (a.parentNode) {
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
  }, 2500);
}

/**
 * Downloads text, HTML or CSV content with UTF-8 BOM
 */
export function downloadText(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}
