/**
 * SONARIS — Hardware Architecture Module
 */
const HardwareArch = (() => {
  'use strict';

  const BLOCKS = {
    sensors: {
      name: 'Environmental Sensors',
      status: 'future',
      role: 'Temperature, salinity, depth, and turbidity sensors that provide real-time environmental data for the adaptive controller.',
      specs: ['Temperature: DS18B20 (±0.5°C)', 'Salinity: Conductivity probe + ADC', 'Depth: Pressure sensor (0-300 bar)', 'Turbidity: Nephelometric sensor'],
      implementation: 'Future hardware integration. Currently simulated via dashboard sliders.',
      color: '#8899aa'
    },
    interface: {
      name: 'Sensor Interface',
      status: 'partial',
      role: 'ADC and communication interface that digitizes analog sensor readings and passes them to the MCU/FPGA.',
      specs: ['12-bit ADC (4 channels)', 'I2C/SPI bus', 'Sampling: 100 Hz per channel', 'Anti-aliasing filter'],
      implementation: 'Partially implemented — ADC interface designed, sensor board in development.',
      color: '#ffab00'
    },
    fpga: {
      name: 'MCU / FPGA Core',
      status: 'implemented',
      role: 'Central processing unit that runs the adaptive algorithm and controls the DDS engine. Uses an FPGA for parallel, real-time waveform generation.',
      specs: ['Xilinx Artix-7 / Zynq platform', '100 MHz system clock', 'Verilog HDL implementation', '32-bit data path'],
      implementation: 'Fully implemented in FPGA prototype. DDS + adaptive controller running on hardware.',
      color: '#00c853'
    },
    adaptive: {
      name: 'Adaptive Controller',
      status: 'implemented',
      role: 'Decision engine that maps environmental conditions to waveform parameters. Implements the C1-C4 classification and parameter lookup.',
      specs: ['4-condition classifier', 'Lookup table for parameters', 'Condition change detection', 'UART telemetry output'],
      implementation: 'Fully implemented in FPGA. Automatically reconfigures DDS on condition change.',
      color: '#00c853'
    },
    dds: {
      name: 'DDS Engine',
      status: 'implemented',
      role: 'Direct Digital Synthesis engine with 32-bit phase accumulator that generates the LFM chirp waveform at the configured frequency.',
      specs: ['32-bit phase accumulator', 'Sine LUT (1024 entries)', 'LFM sweep via phase increment ramp', 'Timer-controlled pulse width'],
      implementation: 'Fully implemented. Phase accumulator + DMA + timer working on FPGA.',
      color: '#00c853'
    },
    dac: {
      name: 'DAC Output',
      status: 'implemented',
      role: 'Digital-to-Analog Converter that converts DDS digital output to an analog waveform for the transducer chain.',
      specs: ['12-bit resolution', 'DMA-driven output', 'Up to 1 MSPS', 'Output: 0-3.3V'],
      implementation: 'Implemented using on-chip DAC with DMA for continuous output.',
      color: '#00c853'
    },
    bpf: {
      name: 'Band-Pass Filter',
      status: 'future',
      role: 'Analog band-pass filter that removes out-of-band noise and DAC quantization artifacts.',
      specs: ['Configurable passband (5-100 kHz)', 'Active Butterworth design', '4th order (24 dB/octave)', 'Low noise op-amps'],
      implementation: 'Future hardware — will be designed based on operating frequency range.',
      color: '#8899aa'
    },
    amp: {
      name: 'Power Amplifier',
      status: 'future',
      role: 'Power amplifier that boosts the filtered signal to the required TX power level for the transducer.',
      specs: ['Class D/AB amplifier', 'Output: 10W-100W configurable', 'Impedance matching to transducer', 'Over-temperature protection'],
      implementation: 'Future hardware — adaptive power control will use DAC gain or amplifier gain.',
      color: '#8899aa'
    },
    transducer: {
      name: 'Transducer Array',
      status: 'future',
      role: 'Piezoelectric transducer that converts electrical signals to acoustic waves and vice versa.',
      specs: ['Piezoelectric ceramic (PZT)', 'Operating: 5-100 kHz', 'Beam width: 10-30°', 'Impedance: 50-100Ω'],
      implementation: 'Future hardware — transducer selection depends on operating frequency and application.',
      color: '#8899aa'
    }
  };

  function init() {
    // Click handlers already in HTML via onclick
  }

  function showDetail(blockId) {
    const block = BLOCKS[blockId];
    if (!block) return;

    const statusMap = { implemented: '✅ Implemented', partial: '🟡 Partial', future: '⬜ Future' };

    const titleEl = document.getElementById('arch-detail-title');
    const bodyEl = document.getElementById('arch-detail-body');
    if (!titleEl || !bodyEl) return;

    titleEl.textContent = block.name;

    bodyEl.innerHTML = `
      <div class="flex items-center gap-4" style="margin-bottom:var(--space-4)">
        <span style="color:${block.color};font-weight:700">${statusMap[block.status]}</span>
      </div>
      <p class="text-muted" style="margin-bottom:var(--space-4)">${block.role}</p>
      <h4 style="margin-bottom:var(--space-3);font-size:var(--text-md)">Specifications</h4>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--space-2)">
        ${block.specs.map(s => `<li style="color:var(--text-secondary);font-size:var(--text-sm)">▸ ${s}</li>`).join('')}
      </ul>
      <div class="divider"></div>
      <h4 style="margin-bottom:var(--space-3);font-size:var(--text-md)">Implementation Status</h4>
      <p class="text-muted">${block.implementation}</p>
    `;

    // Highlight selected block
    document.querySelectorAll('.arch-block').forEach(b => {
      b.style.boxShadow = b.dataset.block === blockId ? 'var(--glow-cyan)' : 'none';
    });
  }

  return { init, showDetail };
})();
