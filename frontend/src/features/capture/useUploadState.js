import { useCallback, useReducer } from 'react';
import { uploadCapture } from './api.js';

export const UploadStatus = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PARSED: 'parsed',
  ERROR: 'error',
};

const initialState = {
  status: UploadStatus.IDLE,
  data: null,
  error: null,
  filename: null,
};
// Acest reducer gestioneaza starile diferite ale procesului de upload: cand incepe upload-ul, cand se primeste un raspuns de succes, cand apare o eroare sau cand se reseteaza starea. Fiecare actiune modifica starea in consecinta, permitand componentelor care folosesc acest hook sa reactioneze la aceste schimbari (de exemplu, afisand un mesaj de eroare sau aratand datele incarcate).
function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { status: UploadStatus.UPLOADING, data: null, error: null, filename: action.filename };
    case 'SUCCESS':
      return { status: UploadStatus.PARSED, data: action.data, error: null, filename: state.filename };
    case 'FAILURE':
      return { status: UploadStatus.ERROR, data: null, error: action.error, filename: state.filename };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
// Acest hook custom este responsabil pentru gestionarea starii upload-ului unui fisier PCAP/PCAPNG. El foloseste un reducer pentru a tine evidenta statusului curent (daca se afla in idle, uploading, parsed sau error), datele rezultate din upload (daca a fost un succes) si eventualele erori. Functia `upload` este apelata pentru a incepe procesul de upload, iar `reset` poate fi folosita pentru a reveni la starea initiala.
export function useUploadState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const upload = useCallback(async (file) => {
    dispatch({ type: 'START', filename: file.name });
    try {
      const data = await uploadCapture(file);
      dispatch({ type: 'SUCCESS', data });
    } catch (err) {
      dispatch({ type: 'FAILURE', error: err.message || 'Eroare necunoscuta.' });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { ...state, upload, reset };
}
