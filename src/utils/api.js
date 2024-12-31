import 'isomorphic-fetch';

export function getApiUrl(req) {
  if (typeof window !== 'undefined') {
    // На клиенте используем относительный URL
    return '';
  }
  
  // На сервере используем полный URL из заголовков запроса
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

export async function fetchApi(path, options = {}, req = null) {
  const baseUrl = getApiUrl(req);
  const url = `${baseUrl}${path}`;
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
