# 🌌 ETLab MITS — Modern Next-Gen Reskin Extension

<div align="center">

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge&logo=googlechrome&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Kiwi-orange?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-Dark%20%7C%20Light-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A complete modern redesign for MITS ETLab (`mits.etlab.app`).**  
*Transforms the legacy portal into a high-performance, dark/light, glassmorphism dashboard with intelligent search, live KTU activity point tracking, unified academic calendar, and Concept 7 split badge tiles.*

</div>

---

## 📸 Screenshots & Showcase

### 🖥️ Dashboard Overview (Dark Mode)
<div align="center">
  <img src="screenshots/screenshot-1.png" alt="ETLab Reskin Full Dashboard" width="100%" style="border-radius: 10px; border: 1px solid #1e2838;"/>
</div>

<br/>

### 📊 Live Stats, Attendance & KTU Activity Points
<div align="center">
  <img src="screenshots/screenshot-2.png" alt="Calendar and Attendance Stats" width="85%" style="border-radius: 8px; border: 1px solid #1e2838;"/>
</div>

<br/>

### 🔍 Smart Search with `/` Shortcut & Concept 7 Badges
<div align="center">
  <img src="screenshots/screenshot-3.png" alt="Search Bar & Actions" width="70%" style="border-radius: 8px; border: 1px solid #1e2838;"/>
</div>

---

## ✨ Key Features

### ⚡ Concept 7 Dual-Tone Split Badge Tiles
- **Two-Tone Compartment Design**: Contrast-tinted icon box on the left, high-contrast action title and controls on the right.
- **8 Outstanding Glowing Colors**: Customize any tile with vivid presets:
  - ⚡ *Electric Blue*, 💎 *Neon Cyan*, 🌿 *Vivid Emerald*, ☀️ *Gold Amber*, 🔥 *Radiant Orange*, 🔴 *Crimson Red*, 🌸 *Hot Magenta*, 🔮 *Cyber Violet*.
- **Favorite Starring**: Pin frequently used services to the top of your dashboard.

### 🔍 Smart Search Bar with Keyboard Shortcuts
- **Instant Keyword Matching & Normalization**: Strips spaces and matches acronyms (e.g. `time table` $\rightarrow$ **Timetable**, `gatepass` $\rightarrow$ **Gate Pass**).
- **College Slang & Synonym Aliases**: Type `cgpa`, `marks`, `fees`, `notes`, `syllabus`, `mess`, or `bunk` to automatically surface the exact tile.
- **Keyboard Hint**: Press <kbd>/</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere to focus search. Press <kbd>Esc</kbd> to dismiss.

### 📅 Unified Academic & Hostel Calendar
- **Live Event Scraping**: Scrapes university holidays, college absents, and hostel leaves directly from ETLab endpoints.
- **Interactive Date Preview**: Click on any date to pop open a detailed breakdown with vector SVG badges (Holidays 🌴, Absents ❌, Hostel Leaves 🛏️, Weekends ☕, Working Days 📚).

### 📈 KTU Activity Points Live Tracker
- Live meter showing your current KTU Activity Points out of 100 with progress bar and remaining points needed for graduation.

### 🌌 Ambient Dotted Canvas Background
- Fixed matrix dot grid across the entire canvas with high visual depth.

### 🌙 Complete Dark & Light Themes
- Carefully calibrated dark mode (`#0c1017`) and clean modern light mode (`#f0f2f5`) with smooth transitions.

### 📱 New Extension Popup (`v1.2`)
- High-res branding, 1-click power switch, dark/light theme switcher, and instant dashboard launcher.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>/</kbd> | Focus & open smart search bar |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> | Focus search bar anywhere on the page |
| <kbd>Esc</kbd> | Dismiss search focus and close color palettes |

---

## 🚀 Installation Guide

### Method 1: Google Chrome / Brave / Edge (Desktop)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/JudeCJz/etlab-reskin-ext.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `etlab-reskin-ext` folder.
6. Open [`https://mits.etlab.app/user/dashboard`](https://mits.etlab.app/user/dashboard) and enjoy!

### Method 2: Android (Kiwi / Lemur Browser)
1. Install **Kiwi Browser** or **Lemur Browser** from Google Play.
2. Download this repo as a `.zip` file to your phone.
3. Open `kiwi://extensions`, enable **Developer mode**, and tap **+(from .zip/.crx)**.
4. Select the `.zip` file — the extension will run automatically on your phone!

---

## 🛠️ Tech Stack & Standards

- **Manifest V3** compliant Chrome Extension
- **Vanilla CSS3** Design System with CSS Variables, container containment (`content-visibility: auto`), and glassmorphism
- **Vanilla JS** with reactive storage sync and lightweight DOM mutation resilience
- **SVG Vector Graphics** (zero raster emoji dependencies)

---

<div align="center">
Made for students of <b>Muthoot Institute of Technology and Science (MITS)</b>.
</div>
