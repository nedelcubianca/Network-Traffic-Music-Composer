import { useCallback, useRef, useState } from 'react';
import { UploadStatus } from '../../features/capture/useUploadState.js';
import { ALLOWED_EXTENSIONS, validatePcapFile } from '../../features/capture/validation.js';
import './PcapUploader.css';

function PcapUploader({ status, error, filename, onUpload }) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = status === UploadStatus.UPLOADING;
  const displayError = localError || error;

  const handleFile = useCallback(
    (file) => {
      setLocalError(null);
      const validationError = validatePcapFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      onUpload(file);
    },
    [onUpload]
  );

  const handleInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      event.target.value = '';
    },
    [handleFile]
  );

  const handleButtonClick = useCallback(() => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }, [isUploading]);

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      if (!isUploading) {
        setIsDragging(true);
      }
    },
    [isUploading]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      if (isUploading) return;

      const file = event.dataTransfer?.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, isUploading]
  );

  const zoneClassName = [
    'pcap-uploader__zone',
    isDragging ? 'pcap-uploader__zone--dragging' : '',
    isUploading ? 'pcap-uploader__zone--uploading' : '',
    displayError ? 'pcap-uploader__zone--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="pcap-uploader">
      <span className="eyebrow">Captura</span>
      <h2 className="pcap-uploader__title">Alege un fișier pentru analiză.</h2>

      <div
        className={zoneClassName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pcap,.pcapng"
          onChange={handleInputChange}
          className="pcap-uploader__input"
          aria-label="Selecteaza fisier PCAP"
        />

        {isUploading ? (
          <div className="pcap-uploader__state">
            <p className="pcap-uploader__state-title">Se parseaza captura…</p>
            {filename && (
              <p className="pcap-uploader__state-hint">{filename}</p>
            )}
          </div>
        ) : (
          <div className="pcap-uploader__state">
            <p className="pcap-uploader__state-title">
              Trage un fișier aici <em>sau</em>
            </p>
            <button
              type="button"
              className="pcap-uploader__button"
              onClick={handleButtonClick}
            >
              Selectează din calculator
            </button>
            <p className="pcap-uploader__state-hint">
              Extensii acceptate: {ALLOWED_EXTENSIONS.join(', ')}.
            </p>
          </div>
        )}
      </div>

      {displayError && (
        <p className="pcap-uploader__error" role="alert">
          {displayError}
        </p>
      )}
    </section>
  );
}

export default PcapUploader;
