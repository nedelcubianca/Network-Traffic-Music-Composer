import * as d3 from 'd3';
import { PROTOCOL_COLORS, PROTOCOL_ORDER } from '../sonification/protocolInstruments.js';

const MARGIN = { top: 12, right: 16, bottom: 28, left: 58 };
// Deseneaza vizualizarea pachetelor: cerculete colorate dupa protocol, benzi rosii pentru zone de atac
export function drawPacketTimeline(svgEl, packets, capture, attackZones) {
  const svg = d3.select(svgEl);
  svg.selectAll('*').remove(); // curata SVG-ul inainte de a desena, pentru a evita suprapunerea elementelor cand se incarca o captura noua

  const svgWidth = svgEl.getBoundingClientRect().width  || svgEl.clientWidth  || 800;
  const svgHeight = svgEl.getBoundingClientRect().height || svgEl.clientHeight || 180;
  const chartWidth = svgWidth - MARGIN.left - MARGIN.right; // latimea efectiva a graficului, dupa ce scadem marginile
  const chartHeight = svgHeight - MARGIN.top - MARGIN.bottom; // inaltimea efectiva a graficului, dupa ce scadem marginile

  const duration = Math.max(capture.duration_seconds || 1, 0.5); // asiguram un minim de durata pentru scalare, pentru a evita problemele cand durata este foarte mica sau nula

  const xScale = d3.scaleLinear() // transforma timpul (in secunde) in pozitie pe axa X
    .domain([0, duration])
    .range([0, chartWidth]);

  const yScale = d3.scaleBand() // imparte axa Y in benzi pentru fiecare protocol
    .domain(PROTOCOL_ORDER)
    .range([0, chartHeight])
    .padding(0.35);

  const sizeMin = capture.size_min ?? 0; // dimensiunea minima a pachetelor, folosita pentru a scala marimea cerculelor
  const sizeMax = Math.max(capture.size_max ?? 1500, sizeMin + 1); // dimensiunea maxima a pachetelor, folosita pentru a scala marimea cerculelor
  const radiusScale = d3.scaleSqrt() // transforma dimensiunea pachetului intr-un radius pentru cerculete, folosind o scala sqrt pentru a face diferentele intre dimensiuni mai vizibile
    .domain([sizeMin, sizeMax])
    .range([2, 6])
    .clamp(true);

  const chart = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`); 

  // Zone de atac: 'attack' = rosu inchis, 'suspicious' = rosu deschis
  const secondWidthPx = Math.max(1, xScale(1) - xScale(0)); 
  chart.append('g').attr('class', 'attack-zones') // desenam dreptunghiuri rosii pentru fiecare secunda care a fost clasificata ca atac sau trafic suspicios
    .selectAll('rect')
    .data(attackZones)
    .join('rect')
    .attr('x', d => xScale(d.second))
    .attr('width', secondWidthPx)
    .attr('y', d => d.trafficType === 'attack' ? 0 : chartHeight * 0.25)
    .attr('height', d => d.trafficType === 'attack' ? chartHeight : chartHeight * 0.5)
    .attr('fill', d => d.trafficType === 'attack'
      ? 'rgba(180, 55, 55, 0.35)' // rosu inchis pentru atacuri
      : 'rgba(180, 55, 55, 0.12)' // rosu deschis pentru trafic suspicios
    );

  chart.append('g').attr('class', 'protocol-guides') // linii orizontale pentru fiecare protocol
    .selectAll('line') 
    .data(PROTOCOL_ORDER)
    .join('line')
    .attr('x1', 0).attr('x2', chartWidth)
    .attr('y1', d => yScale(d) + yScale.bandwidth() / 2)
    .attr('y2', d => yScale(d) + yScale.bandwidth() / 2)
    .attr('stroke', '#DDD5C8')
    .attr('stroke-width', 1);

  const tickCount = Math.min(10, Math.ceil(duration)); // numarul de tick-uri de pe axa X, limitat la 10 pentru a evita aglomerarea cand durata este mare
  chart.append('g') // axa X, cu formatul "0s", "1s", etc
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(
      d3.axisBottom(xScale)
        .ticks(tickCount)
        .tickFormat(d => `${d}s`)
        .tickSizeOuter(0)
    );

  chart.append('g') // axa Y, cu numele protocoalelor
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yScale).tickSize(0).tickPadding(8))
    .call(ax => ax.select('.domain').remove());

  const attackSeconds = new Set(
    attackZones.filter(z => z.trafficType === 'attack').map(z => z.second)
  );

  chart.append('g').attr('class', 'packets')
    .selectAll('circle')
    .data(packets)
    .join('circle')
    .attr('class', 'pkt')
    .attr('data-t', d => d.t)
    .attr('cx', d => xScale(d.t))
    .attr('cy', d => {
      const proto = PROTOCOL_ORDER.includes(d.protocol) ? d.protocol : 'OTHER';
      return yScale(proto) + yScale.bandwidth() / 2;
    })
    .attr('r', d => radiusScale(d.size))
    .attr('fill', d => PROTOCOL_COLORS[d.protocol] || PROTOCOL_COLORS.OTHER)
    .attr('opacity', d => attackSeconds.has(Math.floor(d.t)) ? 0 : 0.2);

  const playheadGroup = chart.append('g').attr('class', 'playhead-group');

  playheadGroup.append('line')
    .attr('class', 'playhead')
    .attr('x1', 0).attr('x2', 0)
    .attr('y1', -6).attr('y2', chartHeight + 2)
    .attr('stroke', '#6B4423')
    .attr('stroke-width', 1.5)
    .attr('pointer-events', 'none');

  playheadGroup.append('polygon')
    .attr('class', 'playhead-tip')
    .attr('points', '-4,-6 4,-6 0,-1')
    .attr('fill', '#6B4423')
    .attr('pointer-events', 'none');

  return { xScale };
}

export function updatePlayhead(svgEl, currentTime, xScale, attackSeconds) {
  const chart = d3.select(svgEl).select('g');
  const x = xScale(currentTime);

  chart.select('.playhead-group')
    .attr('transform', `translate(${x},0)`);

  chart.selectAll('.pkt')
    .attr('opacity', function () {
      const t = parseFloat(this.getAttribute('data-t'));
      if (attackSeconds && attackSeconds.has(Math.floor(t))) return 0;
      return t <= currentTime ? 0.85 : 0.2;
    });
}
