export function getClientId(): string {
  const STORAGE_KEY = 'pdf-compressor-client-id';

  let clientId = localStorage.getItem(STORAGE_KEY);

  if (!clientId) {
    clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, clientId);
  }

  return clientId;
}
