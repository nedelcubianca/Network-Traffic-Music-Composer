# Network Traffic Musical Composer 🎵🌐

A novel approach to network security monitoring using **data sonification**. This web application transforms standard network captures (`.pcap` / `.pcapng`) into a synchronized audio-visual experience. By mapping network protocols to specific musical instruments and pitches, security analysts can *hear* the network state and instantly detect anomalies like Denial of Service (DoS) or Port Scanning without exclusively relying on visual log parsing.

## 🌟 Key Features

* **Audio-Visual Synchronization:** Play back network traffic with perfectly synced audio (via Tone.js) and visual timeline graphs (via D3.js).
* **Protocol Sonification:** Network protocols are mapped to specific synth instruments, colors, and note durations based on their network behavior.
* **Automated Threat Detection:** Built-in heuristics evaluate traffic per second to identify DoS attacks and Port Scans.
* **Alert Highlighting:** Anomalous traffic overrides the harmonious musical background with distorted white noise and is marked with red visual indicators.

## 🏗️ Architecture & Tech Stack

The project follows a decoupled Client-Server architecture to ensure high performance and zero playback latency.

### Backend (Python)
The server is strictly responsible for parsing the capture files. It extracts relative time, protocols, ports, and packet sizes.
* **Language:** Python 3.12
* **Framework:** FastAPI (REST endpoints)
* **Packet Parsing:** Scapy
* **Validation:** Pydantic

### Frontend (JavaScript/React)
All sonification, visualization, and anomaly detection logic runs locally in the browser.
* **Framework:** React 18.3.1 (built with Vite)
* **Audio Engine:** Tone.js (Web Audio API)
* **Visualization:** D3.js (SVG generation)

## 🎼 Sonification Mapping

Traffic properties are mapped to audio parameters to create a harmonious C Major Pentatonic soundscape. The destination port determines the pitch, while the packet size dictates the volume.

| Protocol | Tone.js Instrument | Visual Color | Note Duration |
|---|---|---|---|
| **TCP** | Synth (Triangle Wave) | Purple | 8th note (8n) |
| **UDP** | MembraneSynth | Orange | 16th note (16n) |
| **ICMP** | MetalSynth | Cold Blue | Quarter note (4n) |
| **DNS** | Synth (Sine Wave) | Green | Quarter note (4n) |
| **ARP** | MembraneSynth | Brown | Half note (2n) |
| **OTHER** | Synth (Sine Wave) | Grey | 8th note (8n) |

## 🛡️ Threat Detection

The engine runs a parallel signature-based intrusion detection algorithm during playback:

* **Denial of Service (DoS):** Triggers if a single second contains >100 packets, or if >80% of packets target the exact same destination port. 
* **Port Scanning:** Analyzes a rolling 5-second window. Triggers if >15 unique ports are probed (suspicious) or >50 unique ports (attack).

When an attack is detected, the audio shifts to a bandpass-filtered, distorted white noise, scaling in volume based on the intensity of the attack.

## 🚀 Future Perspectives

* **Live Traffic Capture:** Integrating active packet sniffing via WebSockets for real-time sonification.
* **Expanded Protocol Support:** Adding distinct audio signatures for Layer 7 protocols like HTTP, TLS, SSH, and SMTP.
* **Advanced Threat Signatures:** Implementing detection for ARP spoofing, DNS tunneling, and brute-force attacks.

## 🎓 Acknowledgments

Developed by **Bianca-Nicoleta Nedelcu** (Automatic Control and Computers Faculty, Year III)  
Scientific Coordinator: **Conf. Dr. Ing. Mocanu Ștefan-Alexandru**  
*National University of Science and Technology POLITEHNICA Bucharest (2026)*
