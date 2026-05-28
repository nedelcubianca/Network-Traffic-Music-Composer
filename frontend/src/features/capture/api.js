export async function uploadCapture(file) {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch('/api/captures', { method: 'POST', body: form });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.detail || `Eroare server (HTTP ${response.status}).`);
  }

  return response.json();
}
