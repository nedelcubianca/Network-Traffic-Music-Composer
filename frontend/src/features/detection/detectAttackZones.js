const ATTACK_PACKETS_PER_SECOND = 100;
const SUSPICIOUS_PACKETS_PER_SECOND = 30;
const FLOOD_SAME_PORT_RATIO = 0.8;
const FLOOD_MIN_PACKET_COUNT = 10;

const PORT_SCAN_SUSPICIOUS_PORTS = 15;
const PORT_SCAN_ATTACK_PORTS = 50;
const PORT_SCAN_WINDOW_SECONDS = 5;

export function groupPacketsBySecond(packets) {
  const buckets = new Map();
  for (const packet of packets) {
    const second = Math.floor(packet.t);
    if (!buckets.has(second)) {
      buckets.set(second, { packetCount: 0, packets: [] });
    }
    const bucket = buckets.get(second);
    bucket.packetCount += 1;
    bucket.packets.push(packet);
  }
  return buckets;
}

// clasifica o secunda de trafic doar pentru ddos
export function classifySecond(bucket) {
  const { packetCount, packets } = bucket;
  const dstPortCounts = new Map();
  for (const p of packets) {
    if (p.dst_port != null)
      dstPortCounts.set(p.dst_port, (dstPortCounts.get(p.dst_port) ?? 0) + 1);
  }
  const maxSinglePortCount = dstPortCounts.size > 0 ? Math.max(...dstPortCounts.values()) : 0;
  const isFlood =
    packetCount >= FLOOD_MIN_PACKET_COUNT &&
    maxSinglePortCount / packetCount >= FLOOD_SAME_PORT_RATIO;

  if (packetCount >= ATTACK_PACKETS_PER_SECOND || isFlood) 
    return 'attack';

  if (packetCount >= SUSPICIOUS_PACKETS_PER_SECOND) 
    return 'suspicious';
  return 'normal';
}

// Port scan: acumuleaza pachetele din ultimele 5s si verifica daca au fost destule porturi unice tinta pentru a fi considerate suspicioase
function classifyPortScanInWindow(buckets, currentSecond) {
  const windowPackets = [];
  for (let s = currentSecond - PORT_SCAN_WINDOW_SECONDS + 1; s <= currentSecond; s++) {
    if (buckets.has(s)) 
      windowPackets.push(...buckets.get(s).packets);
  }
  const uniqueDstPorts = new Set(windowPackets.map(p => p.dst_port).filter(p => p != null));
  if (uniqueDstPorts.size >= PORT_SCAN_ATTACK_PORTS)    
    return 'attack';

  if (uniqueDstPorts.size >= PORT_SCAN_SUSPICIOUS_PORTS) 
    return 'suspicious';
  return 'normal';
}

// Returneaza lista de zone anormale pentru vizualizare
export function detectAttackZones(packets) {
  const buckets = groupPacketsBySecond(packets);
  const severity = ['normal', 'suspicious', 'attack'];
  const zones = [];
  for (const [second, bucket] of buckets) {
    const volumeType = classifySecond(bucket);
    const portScanType = classifyPortScanInWindow(buckets, second);
    const finalType  = severity[Math.max(
      severity.indexOf(volumeType),
      severity.indexOf(portScanType)
    )];
    if (finalType !== 'normal') 
      zones.push({ second, trafficType: finalType });
  }
  return zones;
}
