// acest fisier este util doar pentru trafic normal si suspect
const PENTATONIC_SCALE = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];

export function getNoteForPort(port) {
  if (port == null) 
    return PENTATONIC_SCALE[0];
  return PENTATONIC_SCALE[port % PENTATONIC_SCALE.length];
}
