import { useEffect, useRef } from 'react';
import { drawPacketTimeline, updatePlayhead } from '../../features/visualization/drawPacketTimeline.js';
import { detectAttackZones } from '../../features/detection/detectAttackZones.js';
import { PROTOCOL_COLORS, PROTOCOL_ORDER } from '../../features/sonification/protocolInstruments.js';
import './PacketTimeline.css';

function PacketTimeline({ data, currentTime }) {
  const svgRef = useRef(null);
  const xScaleRef = useRef(null);
  const attackSecondsRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const attackZones = detectAttackZones(data.packets);
    attackSecondsRef.current = new Set(
      attackZones.filter(z => z.trafficType === 'attack').map(z => z.second)
    );
    const { xScale } = drawPacketTimeline(svgRef.current, data.packets, data.capture, attackZones);
    xScaleRef.current = xScale;
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !xScaleRef.current) return;
    updatePlayhead(svgRef.current, currentTime, xScaleRef.current, attackSecondsRef.current);
  }, [currentTime]);

  if (!data) return null;

  return (
    <div className="packet-timeline">
      <span className="eyebrow">Vizualizare</span>
      <div className="packet-timeline__canvas">
        <svg ref={svgRef} className="packet-timeline__svg" />
      </div>
      <div className="packet-timeline__legend">
        {PROTOCOL_ORDER.map((name) => (
          <span key={name} className="packet-timeline__legend-item">
            <span
              className="packet-timeline__legend-dot"
              style={{ background: PROTOCOL_COLORS[name] }}
            />
            {name}
          </span>
        ))}
        <span className="packet-timeline__legend-item packet-timeline__legend-item--attack">
          <span className="packet-timeline__legend-attack-zone" />
          atac detectat
        </span>
      </div>
    </div>
  );
}

export default PacketTimeline;
