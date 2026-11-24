// customizer.js - Character Customizer, Photo Upload UV Mapper & Preset Roster

(function(window) {
  'use strict';

  const PRESET_ROSTER = {
    mitraman: {
      id: 'mitraman',
      name: 'MitraMan (Modi)',
      title: 'Supreme Pradhan',
      preset: 'mitraman',
      skinTone: '#e8beac',
      kurtaColor: '#ff9933', // Vibrant Saffron
      pantsColor: '#ffffff', // White Pyjama
      jacketColor: '#1e3a8a', // Deep Blue Modi Vest
      hairStyle: 'beard_turban',
      auraColor: '#ff9900',
      superName: 'MITRA CHAKRA 56"',
      quote: 'Mitron, vikas will happen right now!'
    },
    yatraboy: {
      id: 'yatraboy',
      name: 'Yatra Boy (Rahul)',
      title: 'Marathon Striker',
      preset: 'yatraboy',
      skinTone: '#f0c7b2',
      kurtaColor: '#ffffff', // Signature White Tee
      pantsColor: '#1e293b', // Navy Denim
      jacketColor: '#e2e8f0',
      hairStyle: 'short',
      auraColor: '#10b981', // Green Aura
      superName: 'ALOO SE SONA COMBO',
      quote: 'Khatakhat, fatafat victory is coming!'
    },
    dozerdada: {
      id: 'dozerdada',
      name: 'Dozer Dada (Yogi)',
      title: 'Order Enforcer',
      preset: 'dozerdada',
      skinTone: '#deb887',
      kurtaColor: '#ff7700', // Ochre Saffron
      pantsColor: '#ff7700',
      jacketColor: '#ea580c',
      hairStyle: 'bald_tilak',
      auraColor: '#f59e0b',
      superName: 'DOZER KA DHAMAKA',
      quote: 'Justice delivered without delay!'
    },
    factbhai: {
      id: 'factbhai',
      name: 'Fact Bhai (Dhruv)',
      title: 'Digital Analyst',
      preset: 'factbhai',
      skinTone: '#ecd2be',
      kurtaColor: '#2563eb', // Modern Navy Blazer
      pantsColor: '#18181b',
      jacketColor: '#1d4ed8',
      hairStyle: 'modern',
      auraColor: '#38bdf8', // Cyber Cyan Aura
      superName: 'DOOMSCROLL ANALYTICS',
      quote: 'Namaskar doston, today we analyze a defeat!'
    },
    tarifftaau: {
      id: 'tarifftaau',
      name: 'Tariff Taau (Trump)',
      title: 'The Dealmaker',
      preset: 'tarifftaau',
      skinTone: '#fbcfe8',
      kurtaColor: '#1e3a8a', // Suit & Red Tie
      pantsColor: '#1e293b',
      jacketColor: '#dc2626',
      hairStyle: 'hair_pompadour',
      auraColor: '#eab308', // Golden Aura
      superName: 'TARIFF TSUNAMI 200%',
      quote: 'Nobody fights better than me, believe me!'
    },
    teltsar: {
      id: 'teltsar',
      name: 'Tel Tsar (Putin)',
      title: 'Winter Sovereign',
      preset: 'teltsar',
      skinTone: '#f1dcd4',
      kurtaColor: '#18181b', // Black Tactical
      pantsColor: '#27272a',
      jacketColor: '#3f3f46',
      hairStyle: 'plain',
      auraColor: '#ef4444', // Red Aura
      superName: 'SASTA TEL CRUDE SMASH',
      quote: 'The pipeline of victory never stops.'
    }
  };

  class CharacterCustomizer {
    constructor() {
      this.p1Config = this.loadConfig('p1') || Object.assign({}, PRESET_ROSTER.mitraman);
      this.p2Config = this.loadConfig('p2') || Object.assign({}, PRESET_ROSTER.yatraboy);
      this.activeEditingTarget = 'p1'; // 'p1' or 'p2'

      this.uploadedImages = {
        p1: null,
        p2: null
      };
    }

    loadConfig(target) {
      try {
        const saved = localStorage.getItem(`sansad_fighter_${target}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      return null;
    }

    saveConfig(target, config) {
      try {
        // Strip image DOM elements before stringifying
        const clean = Object.assign({}, config);
        delete clean.photoImage;
        localStorage.setItem(`sansad_fighter_${target}`, JSON.stringify(clean));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }

    setPreset(target, presetKey) {
      const preset = PRESET_ROSTER[presetKey];
      if (!preset) return;

      const targetConfig = target === 'p1' ? this.p1Config : this.p2Config;
      Object.assign(targetConfig, preset);
      targetConfig.photoImage = null; // Clear custom photo when picking preset
      this.saveConfig(target, targetConfig);
    }

    // Process uploaded photo from File or DataURL
    loadUploadedPhoto(target, file, callback) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.uploadedImages[target] = img;
          const targetConfig = target === 'p1' ? this.p1Config : this.p2Config;
          targetConfig.photoImage = img;
          targetConfig.preset = 'custom';
          targetConfig.photoZoom = 1.0;
          targetConfig.photoPanX = 0;
          targetConfig.photoPanY = 0;
          this.saveConfig(target, targetConfig);
          if (callback) callback(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  window.PRESET_ROSTER = PRESET_ROSTER;
  window.CharacterCustomizer = CharacterCustomizer;
})(window);
