import * as Tone from 'tone';
// toate sintetizatoarele au un envelope care descrie cum evolueaza sunetul in timp: attack (cat dureaza pana atinge volumul maxim), decay (cat dureaza pana scade la sustain), sustain (nivelul la care ramane cat timp tasta e apasata) si release (cat dureaza pana dispare dupa ce tasta e eliberata)
export function createInstruments() {
  const masterGain = new Tone.Gain(0.7).toDestination();
  // maxPolyphony = nr max de note care pot fi redate simultan, pentru a preveni supraincarcarea audio si a pastra claritatea sunetului
  const TCP = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    oscillator: { type: 'triangle' },// forma undei generate de oscilator ( triangle are un sunet mai cald si mai putin agresiv decat square sau sawtooth, potrivit pentru conexiunile TCP care sunt mai "stabile")
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.05 }, 
  });

  const UDP = new Tone.PolySynth(Tone.MembraneSynth, {
    maxPolyphony: 4,
    pitchDecay: 0.05,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.02 }, 
  });

  const ICMP = new Tone.PolySynth(Tone.MetalSynth, {
    maxPolyphony: 3,
    envelope: { attack: 0.001, decay: 0.3, release: 0.05 }, 
    modulationIndex: 32,
    resonance: 3000,
    octaves: 1.2,
  });
  const icmpGain = new Tone.Gain(0.4);
  ICMP.connect(icmpGain);
  icmpGain.connect(masterGain);

  const DNS = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.05 }, // 4n=0.5s
  });

  const ARP = new Tone.PolySynth(Tone.MembraneSynth, {
    maxPolyphony: 2,
    pitchDecay: 0.15,
    octaves: 1,
    envelope: { attack: 0.001, decay: 0.7, sustain: 0, release: 0.15 },
  });

  const OTHER = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.12, sustain: 0.1, release: 0.05 }, 
  });

  [TCP, UDP, DNS, ARP, OTHER].forEach(s => s.connect(masterGain));

  // Zgomot alb + distorsiune — sunet de haos puternic pentru momentele de atac
  const attackNoise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 1.0, release: 0.3 },
  });
  const attackDistortion = new Tone.Distortion(0.7); // distorsiune puternica pentru a transforma zgomotul alb intr-un sunet agresiv
  const attackFilter = new Tone.Filter({ type: 'bandpass', frequency: 1800, Q: 1.5 }); // filtrare pentru a scoate frecventele foarte joase si foarte inalte
  const attackGain = new Tone.Gain(3.0); // amplificare puternica pentru a face atacurile sa iasa in evidenta, dar va fi limitata de masterGain
  attackNoise.connect(attackDistortion);
  attackDistortion.connect(attackFilter);
  attackFilter.connect(attackGain);
  attackGain.connect(masterGain);

  const attackSynth = {
    trigger:  (velocity, duration, time) =>
      attackNoise.triggerAttackRelease(duration, time, velocity),
    dispose:  () => {
      attackNoise.dispose();
      attackDistortion.dispose();
      attackFilter.dispose();
      attackGain.dispose();
    },
  };

  function releaseAll() {
    [TCP, UDP, ICMP, DNS, ARP, OTHER].forEach(s => {
      if (typeof s.releaseAll === 'function') s.releaseAll();
    });
  }

  function dispose() { // eliberarea memoriei audio
    [TCP, UDP, ICMP, DNS, ARP, OTHER].forEach(s => s.dispose());
    icmpGain.dispose();
    attackSynth.dispose();
    masterGain.dispose();
  }

  return { TCP, UDP, ICMP, DNS, ARP, OTHER, attackSynth, releaseAll, dispose };
}
