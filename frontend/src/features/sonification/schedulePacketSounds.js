import * as Tone from 'tone';
import { PROTOCOL_INSTRUMENTS } from './protocolInstruments.js';
import { getNoteForPort } from './portToNote.js';
import { groupPacketsBySecond, detectAttackZones } from '../detection/detectAttackZones.js';

const MAX_SOUNDS_PER_SECOND = 8; // Maxim 8 sunete pe secunda — evita anularea sunetelor

// daca intr-o secunda sunt 500 de pachete, nu poti canta 500 de note simultan. Functia alege maximum 8, distribuite uniform
function pickRepresentativePackets(packets) {
  if (packets.length <= MAX_SOUNDS_PER_SECOND) 
    return packets;

  const step = packets.length / MAX_SOUNDS_PER_SECOND;
  return Array.from({ length: MAX_SOUNDS_PER_SECOND }, (_, i) =>
    packets[Math.floor(i * step)]
  );
}

// sunet pentru trafic normal — traducem dimensiunea pachetului intr-un volum intre 0.2 si 0.8, pentru a avea un impact sonor vizibil
function getVolumeForPacketSize(size, minSize, maxSize) {
  if (maxSize === minSize) 
    return 0.5;

  return 0.2 + 0.6 * ((size - minSize) / (maxSize - minSize));
}

// pentru atacuri, volumul creste logaritmic in functie de numarul de pachete, pentru a evidentia diferentele intre atacuri mici si mari, dar fara a avea un impact sonor prea mare
function getAttackVolumeFromPacketCount(packetCount) {
  const logCount = Math.log10(Math.max(1, packetCount));
  const normalized = (logCount - Math.log10(10)) / (Math.log10(2000) - Math.log10(10));
  return 0.55 + Math.max(0, Math.min(1, normalized)) * 0.45;
}
// programam notele sa cante la momentul potrivit
export function schedulePacketSounds(packets, sizeRange, instruments, options = {}) {
  Tone.Transport.cancel(0);

  const secondBuckets = groupPacketsBySecond(packets);
  const zoneMap = new Map(detectAttackZones(packets).map(z => [z.second, z.trafficType]));

  for (const [second, bucket] of secondBuckets) {
    const trafficType = zoneMap.get(second) ?? 'normal';

    if (trafficType === 'attack') {
      // Toata secunda de atac devine un singur zgomot haotic
      const volume = getAttackVolumeFromPacketCount(bucket.packetCount);
      Tone.Transport.schedule((time) => {
        instruments.attackSynth.trigger(volume, 1.0, time);
      }, second);
    } else {
      const packetsToPlay = pickRepresentativePackets(bucket.packets);
      for (const packet of packetsToPlay) {
        Tone.Transport.schedule((time) => {
          const instrument = instruments[packet.protocol] ?? instruments.OTHER;
          const note = getNoteForPort(packet.dst_port);
          const volume = getVolumeForPacketSize(packet.size, sizeRange.min, sizeRange.max);
          const duration = PROTOCOL_INSTRUMENTS[packet.protocol]?.noteDuration ?? '8n';
          instrument.triggerAttackRelease(note, duration, time, volume);
        }, packet.t);
      }
    }
  }

  if (options.onComplete) {
    Tone.Transport.scheduleOnce(() => {
      setTimeout(options.onComplete, 0);
    }, options.endTime);
  }
}
