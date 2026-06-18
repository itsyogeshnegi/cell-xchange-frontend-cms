import API from './axios';

export const openProtectedFile = async (url, params = {}) => {
  const response = await API.get(url, {
    params,
    responseType: 'blob',
  });

  const blobUrl = window.URL.createObjectURL(response.data);
  const openedWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

  if (!openedWindow) {
    window.location.href = blobUrl;
  }

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60000);
};
