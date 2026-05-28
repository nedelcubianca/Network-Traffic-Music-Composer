from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

# Acestea sunt modelele de date folosite in API. Ele definesc structura raspunsului JSON pe care o va primi frontend-ul dupa uploadarea unui fisier PCAP/PCAPNG
ProtocolName = Literal["TCP", "UDP", "ICMP", "DNS", "ARP", "OTHER"]

class Packet(BaseModel):
    t: float = Field(..., description="Secunde de la inceputul capturii")
    protocol: ProtocolName
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    size: int

class ProtocolCounts(BaseModel):
    TCP: int = 0
    UDP: int = 0
    ICMP: int = 0
    DNS: int = 0
    ARP: int = 0
    OTHER: int = 0

class CaptureMetadata(BaseModel):
    filename: str
    total_packets: int
    duration_seconds: float
    size_min: int
    size_max: int
    peak_pps: int
    protocol_counts: ProtocolCounts

class CaptureResponse(BaseModel):
    capture: CaptureMetadata
    packets: list[Packet]
