import TransportControls from '../Player/TransportControls.jsx';
import PacketTimeline from '../Visualization/PacketTimeline.jsx';
import { usePlayback } from '../../features/sonification/usePlayback.js';
import { formatDuration } from '../../features/capture/formatDuration.js';
import { PROTOCOL_ORDER } from '../../features/sonification/protocolInstruments.js';
import './CaptureSummary.css';

function CaptureSummary({ data, onReset }) {
  const {status, currentTime, duration, play, pause, stop, isReady} = usePlayback(data);
  const { capture } = data || {};

  if (!capture) 
    return null;

  const total = capture.total_packets;
  const protocolEntries = PROTOCOL_ORDER
    .map((name) => ({ name, count: capture.protocol_counts?.[name] ?? 0 }))
    .filter((entry) => entry.count > 0);

  return (
    <section className="capture-summary">
      <span className="eyebrow">Captura incarcata</span>
      <h2 className="capture-summary__filename">
        <em>{capture.filename}</em>
      </h2>

      <TransportControls
        status={status}
        currentTime={currentTime}
        duration={duration}
        isReady={isReady}
        onPlay={play}
        onPause={pause}
        onStop={stop}
      />

      <PacketTimeline data={data} currentTime={currentTime} />

      <dl className="capture-summary__stats">
        <div className="capture-summary__stat">
          <dt className="capture-summary__stat-label">Pachete</dt>
          <dd className="capture-summary__stat-value">
            {total.toLocaleString('ro-RO')}
          </dd>
        </div>

        <div className="capture-summary__stat">
          <dt className="capture-summary__stat-label">Durata</dt>
          <dd className="capture-summary__stat-value">
            {formatDuration(capture.duration_seconds)}
          </dd>
        </div>

        <div className="capture-summary__stat">
          <dt className="capture-summary__stat-label">Rata maxima</dt>
          <dd className="capture-summary__stat-value">
            {capture.peak_pps} <span className="capture-summary__unit">pps</span>
          </dd>
        </div>

        <div className="capture-summary__stat">
          <dt className="capture-summary__stat-label">Intervale dimensiune pachete</dt>
          <dd className="capture-summary__stat-value">
            {capture.size_min === capture.size_max
              ? capture.size_min
              : capture.size_min + '–' + capture.size_max
            }{' '}
            <span className="capture-summary__unit">B</span>
          </dd>
        </div>
      </dl>

      {protocolEntries.length > 0 && (
        <div className="capture-summary__protocols">
          <h3 className="capture-summary__protocols-title">Protocoale</h3>

          <ul className="capture-summary__protocol-list">
            {protocolEntries.map((entry) => {
              const percent = total > 0 ? (entry.count / total) * 100 : 0;
              return (
                <li key={entry.name} className="capture-summary__protocol">
                  <span className="capture-summary__protocol-name">
                    {entry.name}
                  </span>

                  <span
                    className="capture-summary__protocol-bar"
                    aria-hidden="true"
                  >
                    <span
                      className="capture-summary__protocol-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </span>

                  <span className="capture-summary__protocol-count">
                    {entry.count.toLocaleString('ro-RO')}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="capture-summary__actions">
        <button
          type="button"
          className="capture-summary__reset"
          onClick={onReset}
        >
          Incarca alta captura
        </button>
      </div>
    </section>
  );
}

export default CaptureSummary;
