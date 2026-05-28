const API = import.meta.env.VITE_API_URL || '';

export async function uploadCapture(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API}/api/captures`, { method: 'POST', body: form });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.detail || `Eroare server (HTTP ${response.status}).`);
  }
  return response.json();
}
