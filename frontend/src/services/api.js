import config from './config';

export const API_BASE_URL = config.API_BASE_URL;

// Example API call
export const processImages = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/processes/`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};