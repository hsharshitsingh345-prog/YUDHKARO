# ⚔️ YUDHKARO — 3D Satire Fighting Game

[![WebGL](https://img.shields.io/badge/WebGL-60%2B%20FPS-brightgreen?style=for-the-badge&logo=webgl)](https://hsharshitsingh345-prog.github.io/YUDHKARO/)
[![Three.js](https://img.shields.io/badge/Engine-Three.js-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://hsharshitsingh345-prog.github.io/YUDHKARO/)

> **YUDHKARO** (*Sansad Showdown: Custom Face Edition*) is a high-performance 3D browser-based arcade fighting game. Built with pure WebGL and Three.js, it lets players choose satire political icons or **upload ANY photo** to project anyone's face directly onto a 3D fighter mesh in real-time, backed by frame-accurate combat mechanics, dynamic camera tracking, and procedural audio.

🎮 **[Play Live Web Demo](https://hsharshitsingh345-prog.github.io/YUDHKARO/)**

---

## 🌟 Key Features

### 📸 1. Custom Face Photo Projection UV Mapper
- **Upload Any Photo**: Select or drag-and-drop any portrait photo (yourself, a friend, an actor, or a political figure).
- **Dynamic 3D Texture Mapping**: Automatically crops and composites the face into the UV coordinates of the 3D head mesh with responsive PBR material lighting.
- **Full Customizer**: Modify Kurta/top colors, Modi/Nehru vest colors, facial hairstyles, accessories (Royal Pagdi with Kalgi brooch, Khadi Gandhi Topi, Trump Pompadour), and custom Super Move titles.

### 🥊 2. Frame-Accurate Fighting Mechanics
- **Complete Combat System**: Light Jabs, Heavy Crosses, Front Kicks, Roundhouses, Low Sweeps (trip knockdown), and Uppercut Launchers for aerial juggling.
- **80% Guard / Block Engine**: Holding back or crouching deflects attacks with blue energy sparks and chip damage.
- **Super Move Meter (35% Max HP Cinematic)**: Dealing and taking damage charges the Chakra/Super bar. At 100%, trigger a dramatic cinematic slow-motion face zoom, speech callout, and an unstoppable multi-hit combo!

### 🏛️ 3. 3D Sansad Bhavan (Parliament) Arena
- Polished dark mahogany parquet floor with the 24-spoke Ashoka Chakra inlay.
- Saffron and emerald green aisle runners.
- Grand Dholpur sandstone pillars with ornate gold capitals.
- Speaker's podium with the Lion Capital relief plaque.
- Animated 2.5D/3D Member of Parliament spectator crowd that cheers and waves flags during big hits.

### 🔊 4. Synthesized Procedural Web Audio Engine
- **100% Zero-External-Asset Audio**: Synthesizes light punches, heavy kick thuds, uppercut blasts, metal block clangs, limb swooshes, super power build-up, and crowd cheers using the browser's native Web Audio API.
- **Dynamic Voice Announcer**: Speech Synthesis announces rounds (*"ROUND 1"*, *"FIGHT!"*, *"K.O.!"*, *"VICTORY!"*).

### ⚡ 5. Maximum Performance (60–120 FPS WebGL)
- Hierarchical articulated humanoid rig for instant load times and zero network overhead.
- Object pooling for comic hit sparks, dust kickups, and floating damage numbers.
- Dynamic tracking Cinemachine camera with screen shake and slow-mo finishers.

---

## 🕹️ Controls Guide

| Action | Player 1 (Keyboard) | Player 2 (Local 2P Mode) |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `Left Arrow` / `Right Arrow` |
| **Jump** | `W` | `Up Arrow` |
| **Crouch / Block** | `S` (or hold back) | `Down Arrow` (or hold back) |
| **Jab (Light Punch)** | `F` | `Numpad 1` or `U` |
| **Cross (Mid Punch)** | `G` | `Numpad 2` or `I` |
| **Kick (Mid Kick)** | `K` | `Numpad 3` or `O` |
| **Uppercut (Air Launcher)** | `H` | `Numpad 4` or `P` |
| **Sweep (Trip Knockdown)** | `V` | `Numpad 0` or `M` |
| **Signature Special** | `B` | `Numpad .` or `L` |
| **Cinematic Super Move** | `Space` | `Enter` or `Y` |

---

## ⚔️ Satire Political Roster Presets

1. **MitraMan (Modi)** — *Supreme Pradhan* (Super: `MITRA CHAKRA 56"`)
2. **Yatra Boy (Rahul)** — *Marathon Striker* (Super: `ALOO SE SONA COMBO`)
3. **Dozer Dada (Yogi)** — *Order Enforcer* (Super: `DOZER KA DHAMAKA`)
4. **Fact Bhai (Dhruv)** — *Digital Analyst* (Super: `DOOMSCROLL ANALYTICS`)
5. **Tariff Taau (Trump)** — *The Dealmaker* (Super: `TARIFF TSUNAMI 200%`)
6. **Tel Tsar (Putin)** — *Winter Sovereign* (Super: `SASTA TEL CRUDE SMASH`)

---

## 🚀 Running Locally

Clone the repository and run with any static server or Node.js:

```bash
# Clone the repository
git clone https://github.com/hsharshitsingh345-prog/YUDHKARO.git
cd YUDHKARO

# Run with Node.js
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
YUDHKARO/
├── index.html        # Main HTML5 layout, arcade UI, and customizer modal
├── three.min.js      # Three.js WebGL rendering library (r128)
├── fighter.js        # 3D Articulated fighter rig, procedural animations & UV face mapper
├── arena.js          # 3D Sansad Bhavan Parliament stage, pillars & crowd
├── combat.js         # Hitbox resolution, damage table, combos & AI state machine
├── audio.js          # Web Audio procedural sound synthesizer & announcer
├── customizer.js     # Character creator, photo upload handler & roster presets
├── game.js           # Engine loop, Cinemachine camera, VFX particles & 2D HUD
├── server.js         # Lightweight Node.js local streaming server
├── package.json      # Project metadata & npm scripts
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Pages automated deployment pipeline
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
