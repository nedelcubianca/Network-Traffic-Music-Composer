export const PROTOCOL_ORDER = ['TCP', 'UDP', 'ICMP', 'DNS', 'ARP', 'OTHER']; 

export const PROTOCOL_INSTRUMENTS = {
  TCP:   { color: '#7B5EA7', synthType: 'triangle', noteDuration: '8n'  },
  UDP:   { color: '#C07D3A', synthType: 'membrane', noteDuration: '16n' },
  ICMP:  { color: '#4A7FA5', synthType: 'metal',    noteDuration: '4n'  },
  DNS:   { color: '#3A7D44', synthType: 'sine',     noteDuration: '4n'  },
  ARP:   { color: '#8B5E3C', synthType: 'membrane', noteDuration: '2n'  },
  OTHER: { color: '#7A7A7A', synthType: 'sine',     noteDuration: '8n'  },
};

export const PROTOCOL_COLORS = Object.fromEntries(
  Object.entries(PROTOCOL_INSTRUMENTS).map(([proto, cfg]) => [proto, cfg.color])
); // pentru legenda grafica

