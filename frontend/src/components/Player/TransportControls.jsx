import { PlaybackStatus } from '../../features/sonification/usePlayback.js';
import { formatDuration } from '../../features/capture/formatDuration.js';
import './TransportControls.css';

function TransportControls({status, currentTime, duration, isReady, onPlay, onPause, onStop}) {
  const isPlaying = status === PlaybackStatus.PLAYING;

  return (
    <div className="transport-controls">
      <div className="transport-controls__buttons">
        {isPlaying ? (
          <button
            type="button"
            className="transport-controls__primary"
            onClick={onPause}
            disabled={!isReady}
          >
            Pauza
          </button>
        ) : (
          <button
            type="button"
            className="transport-controls__primary"
            onClick={onPlay}
            disabled={!isReady}
          >
            {status === PlaybackStatus.PAUSED ? 'Continua' : 'Reda'}
          </button>
        )}

        <button
          type="button"
          className="transport-controls__secondary"
          onClick={onStop}
          disabled={!isReady || status === PlaybackStatus.IDLE}
        >
          Stop
        </button>
      </div>

      <div className="transport-controls__time">
        <span className="transport-controls__time-current">
          {formatDuration(currentTime)}
        </span>
        <span className="transport-controls__time-sep">/</span>
        <span className="transport-controls__time-total">
          {formatDuration(duration)}
        </span>
      </div>

    </div>
  );
}

export default TransportControls;
