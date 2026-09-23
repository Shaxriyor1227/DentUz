import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage page title and meta description for SEO & browser navigation.
 * @param {string} title - Page title to be prefixed before | DentUz
 * @param {string} [description] - Meta description content
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | DentUz - Zamonaviy Stomatologiya OS`;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}

export default usePageMeta;
