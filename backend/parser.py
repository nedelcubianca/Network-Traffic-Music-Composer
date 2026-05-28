from __future__ import annotations
import io
import math
from collections import Counter
from typing import Optional

from scapy.error import Scapy_Exception
from scapy.layers.dns import DNS
from scapy.layers.inet import ICMP, TCP, UDP
from scapy.layers.l2 import ARP
from scapy.utils import rdpcap

from models import CaptureMetadata, CaptureResponse, Packet, ProtocolCounts
DNS_PORT = 53

# Functii ajutatoare — extrag informatii dintr-un pachet Scapy

def get_protocol(pkt) -> str: 
    # Determina protocolul principal al pachetului (ARP > ICMP > DNS > TCP > UDP).
    if pkt.haslayer(ARP):
        return "ARP"
    if pkt.haslayer(ICMP):
        return "ICMP"
    # DNS poate circula pe UDP sau TCP, identificam dupa layer sau port
    if pkt.haslayer(DNS):
        return "DNS"
    if pkt.haslayer(UDP) and (pkt[UDP].sport == DNS_PORT or pkt[UDP].dport == DNS_PORT):
        return "DNS"
    if pkt.haslayer(TCP) and (pkt[TCP].sport == DNS_PORT or pkt[TCP].dport == DNS_PORT):
        return "DNS"
    if pkt.haslayer(TCP):
        return "TCP"
    if pkt.haslayer(UDP):
        return "UDP"
    return "OTHER"

def get_ports(pkt) -> tuple[Optional[int], Optional[int]]:
    # Returneaza (src_port, dst_port) pentru TCP/UDP, altfel (None, None)
    if pkt.haslayer(TCP):
        return int(pkt[TCP].sport), int(pkt[TCP].dport)
    if pkt.haslayer(UDP):
        return int(pkt[UDP].sport), int(pkt[UDP].dport)
    return None, None

# Parsarea propriu-zisa a fisierului PCAP
def parse_pcap_bytes(data: bytes, filename: str) -> CaptureResponse:
    try:
        raw_packets = rdpcap(io.BytesIO(data))
    except (Scapy_Exception, Exception) as exc:
        raise ValueError(f"format PCAP invalid: {exc}") from exc

    # Captura goala — returnam un raspuns valid cu zero pachete
    if len(raw_packets) == 0:
        return CaptureResponse(
            capture=CaptureMetadata(
                filename=filename,
                total_packets=0,
                duration_seconds=0.0,
                size_min=0,
                size_max=0,
                peak_pps=0,
                protocol_counts=ProtocolCounts(),
            ),
            packets=[],
        )

    start_time = float(raw_packets[0].time)
    packets_out: list[Packet] = []
    sizes: list[int] = []
    proto_counter: Counter[str] = Counter()
    pps_buckets: Counter[int] = Counter()  # numarul de pachete din fiecare secunda
    last_t = 0.0

    for pkt in raw_packets:
        t = float(pkt.time) - start_time  # timp relativ fata de primul pachet
        size = int(len(pkt))
        protocol = get_protocol(pkt)
        src_port, dst_port = get_ports(pkt)
        packets_out.append(Packet(t=t, protocol=protocol, src_port=src_port, dst_port=dst_port, size=size))
        sizes.append(size)
        proto_counter[protocol] += 1
        pps_buckets[int(math.floor(t))] += 1  # incadram pachetul in secunda sa
        last_t = t

    return CaptureResponse(
        capture=CaptureMetadata(
            filename=filename,
            total_packets=len(packets_out),
            duration_seconds=last_t,
            size_min=min(sizes),
            size_max=max(sizes),
            peak_pps=max(pps_buckets.values()),
            protocol_counts=ProtocolCounts(
                TCP=proto_counter.get("TCP", 0),
                UDP=proto_counter.get("UDP", 0),
                ICMP=proto_counter.get("ICMP", 0),
                DNS=proto_counter.get("DNS", 0),
                ARP=proto_counter.get("ARP", 0),
                OTHER=proto_counter.get("OTHER", 0),
            ),
        ),
        packets=packets_out,
    )
