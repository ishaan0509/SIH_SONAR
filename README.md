# SONARIS — Adaptive Underwater Signal Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Platform: Web & FPGA](https://img.shields.io/badge/Hardware-Xilinx%20Artix--7-teal.svg)](https://github.com/ishaan0509/SIH_SONAR)
[![DSP Engine: Real-Time](https://img.shields.io/badge/DSP-DDS%20%7C%20FFT%20%7C%20LFM%20Chirp-green.svg)](https://github.com/ishaan0509/SIH_SONAR)

**SONARIS** is an interactive, browser-based mission-control and scientific signal-analysis platform for adaptive underwater sonar systems. It bridges embedded FPGA hardware design, real-time digital signal processing (DSP), environmental classification, and interactive acoustic visualization.

---

## 🚀 Key Modules

### 1. 🌊 Underwater Acoustics & Sound Propagation (`#uw-acoustics`)
- **Empirical Sound Velocity Profiles (SVP)**:
  - Compares Temperature vs. Depth and Sound Speed $C(T, D, S)$ vs. Depth using **Medwin Eq. (1)** and **Mackenzie (1981)** UNESCO formulations:
    $$C(T, D, S) = 1449.2 + 4.6\,T - 0.055\,T^2 + 0.00029\,T^3 + (1.34 - 0.010\,T)(S - 35) + 0.016\,D$$
  - Presets: *Eastern Pacific Winter*, *Polar High-Latitude Cold Water*, and *Tropical Deep Ocean (SOFAR axis)*.
- **Snell's Law Acoustic Ray Tracing**:
  - Simulates $\frac{\cos(\theta_1)}{C_1} = \frac{\cos(\theta_2)}{C_2} = \text{constant}$ displaying ray paths, acoustic shadow zones, and SOFAR ducting.
- **Seawater Attenuation $\alpha(f)$**:
  - Full Ainslie-McColm formulation (Boric acid relaxation, Magnesium Sulfate $\text{MgSO}_4$, and pure water viscous absorption).
- **Transmission Loss (TL) & Ambient Noise**:
  - Spherical vs. cylindrical waveguide spreading and Wenz ambient ocean noise curves.

### 2. 🎯 Mission Control (`#mission-control`)
- **4 Environmental Condition Presets (C1–C4)**:
  - **C1**: Deep Ocean SOFAR Channel ($1200\,\text{m}$, $4^\circ\text{C}$, $35\,\text{PSU}$)
  - **C2**: Shallow Coastal Harbor ($35\,\text{m}$, $22^\circ\text{C}$, $32.5\,\text{PSU}$)
  - **C3**: Stormy / High-Noise Sea ($250\,\text{m}$, $14^\circ\text{C}$, $34.5\,\text{PSU}$)
  - **C4**: Severe Thermocline Multipath ($80\,\text{m}$, $28^\circ\text{C}$, $36\,\text{PSU}$)
- **Plan Position Indicator (PPI) Radar**:
  - $360^\circ$ sweeping beam radar tracking 3 underwater contacts.

### 3. ⚡ FPGA Prototype Live Sonar (`#live-sonar`)
- Prototype DIP switch controller emulating FPGA controller modes:
  - **Switch 1 (C1)**: $1\text{--}5\text{ MHz}$ chirp in $10\ \mu\text{s}$ ($B = 4\text{ MHz}$, $k = 400\text{ GHz/s}$, $+16.02\text{ dB}$ gain).
  - **Switch 2 (C2)**: $1\text{--}4\text{ MHz}$ chirp in $12\ \mu\text{s}$ ($B = 3\text{ MHz}$, $k = 250\text{ GHz/s}$, $+15.56\text{ dB}$ gain).
  - **Switch 3 (C3)**: $1\text{--}3\text{ MHz}$ chirp in $8\ \mu\text{s}$ ($B = 2\text{ MHz}$, $k = 250\text{ GHz/s}$, $+12.04\text{ dB}$ gain).
  - **Switch 4 (C4)**: $1\text{--}2\text{ MHz}$ chirp in $6\ \mu\text{s}$ ($B = 1\text{ MHz}$, $k = 166.7\text{ GHz/s}$, $+7.78\text{ dB}$ gain).
- Microsecond oscilloscope ($\mu\text{s}$), RF spectrum analyzer ($\text{MHz}$), and pipelined matched filter pulse compression.

### 4. 💻 MATLAB & Simulink Workbench (`#matlab-validation`)
- File uploader for `.m` scripts and `.slx/.mdl` Simulink models.
- Preloaded scripts (`lfm_matched_filter.m`, `acoustic_multipath_model.slx`, `fpga_fixedpoint_validation.m`).
- In-browser execution console, overlay comparison, and quantization residual error plots.

### 5. 🔬 Past Experiments & Dataset Export (`#experiments`)
- 8 preloaded benchmark oceanographic trials across marine basins.
- Filter and search capabilities + **Download Dataset as CSV**.

---

## 🛠️ Technology Stack
- **Frontend**: Vanilla JavaScript (Modular ES6), CSS Custom Properties, HTML5.
- **Plotting**: Plotly.js with custom sonar dark theme.
- **Formula Engine**: MathJax (TeX/MathML).
- **DSP Engine**: Pure JS Cooley-Tukey Radix-2 FFT/IFFT, STFT, LFM chirp generators, and Cross-Correlation filters.

---

## 🏃 Running Locally

```bash
# Clone the repository
git clone https://github.com/ishaan0509/SIH_SONAR.git
cd SIH_SONAR

# Start local web server
python3 -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.
