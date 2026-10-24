import { soundscape } from './audio.js';
import { showNotificationToast } from './scrollytelling.js';
import { translations } from './translations.js';

export function initPerfumeMixer() {
  const sliderTop = document.getElementById('slider-top');
  const sliderMid = document.getElementById('slider-mid');
  const sliderBase = document.getElementById('slider-base');

  const valTop = document.getElementById('val-top');
  const valMid = document.getElementById('val-mid');
  const valBase = document.getElementById('val-base');

  const liquidEl = document.getElementById('perfume-liquid-fill');
  const auraEl = document.getElementById('flacon-ambient-aura');
  const bottleNameEl = document.getElementById('bottle-engraved-name');
  const scentIdEl = document.getElementById('generated-scent-id');
  const sprayBtn = document.getElementById('btn-spray-test');
  const applyFormulaBtn = document.getElementById('btn-apply-formula');

  // New Profile Elements
  const archetypeTagEl = document.getElementById('scent-archetype-tag');
  const personaTitleEl = document.getElementById('scent-persona-title');
  const personaDescEl = document.getElementById('scent-persona-desc');
  const dominantBadgeEl = document.getElementById('scent-dominant-badge');

  const barSegTop = document.getElementById('bar-seg-top');
  const barSegMid = document.getElementById('bar-seg-mid');
  const barSegBase = document.getElementById('bar-seg-base');
  const labelSegTop = document.getElementById('label-seg-top');
  const labelSegMid = document.getElementById('label-seg-mid');
  const labelSegBase = document.getElementById('label-seg-base');

  const meterFresh = document.getElementById('meter-fresh');
  const meterWarm = document.getElementById('meter-warm');
  const meterLongevity = document.getElementById('meter-longevity');

  const presetBtns = document.querySelectorAll('.preset-pill-btn');
  const bookingEngraveInput = document.getElementById('booking-engraved-name');
  const formScentFormula = document.getElementById('form-selected-formula');

  let currentDominantTheme = 'balanced';

  function updateMixer() {
    const activeLang = document.documentElement.lang || 'vi';
    const dict = translations[activeLang] || translations.vi;

    const top = parseInt(sliderTop.value, 10);
    const mid = parseInt(sliderMid.value, 10);
    const base = parseInt(sliderBase.value, 10);
    const total = top + mid + base;

    const pTop = Math.round((top / total) * 100);
    const pMid = Math.round((mid / total) * 100);
    const pBase = 100 - pTop - pMid;

    if (valTop) valTop.textContent = `${pTop}%`;
    if (valMid) valMid.textContent = `${pMid}%`;
    if (valBase) valBase.textContent = `${pBase}%`;

    // 1. Update Segmented Ratio Bar
    const segTopName = dict.seg_label_top || 'Sen Nhài';
    const segMidName = dict.seg_label_mid || 'Đàn Hương';
    const segBaseName = dict.seg_label_base || 'Khói Trầm';
    if (barSegTop) {
      barSegTop.style.width = `${pTop}%`;
      if (labelSegTop) labelSegTop.textContent = `${pTop}% ${segTopName}`;
    }
    if (barSegMid) {
      barSegMid.style.width = `${pMid}%`;
      if (labelSegMid) labelSegMid.textContent = `${pMid}% ${segMidName}`;
    }
    if (barSegBase) {
      barSegBase.style.width = `${pBase}%`;
      if (labelSegBase) labelSegBase.textContent = `${pBase}% ${segBaseName}`;
    }

    const hr = dict.hours_suffix || 'Giờ';

    // 2. Dynamic Archetype & Flacon Transformation
    if (pTop >= 42) {
      // DAWN DOMINANT (Fresh Lotus Jade Green)
      currentDominantTheme = 'dawn';
      if (archetypeTagEl) archetypeTagEl.textContent = dict.persona_dawn_tag;
      if (personaTitleEl) personaTitleEl.textContent = dict.persona_dawn_title;
      if (personaDescEl) personaDescEl.textContent = dict.persona_dawn_desc;
      if (dominantBadgeEl) dominantBadgeEl.textContent = dict.persona_dawn_dom;

      if (meterFresh) meterFresh.textContent = `${Math.min(98, 70 + Math.round(pTop * 0.4))}/100`;
      if (meterWarm) meterWarm.textContent = `${Math.max(30, 60 - Math.round(pTop * 0.3))}/100`;
      if (meterLongevity) meterLongevity.textContent = `6 – 8 ${hr}`;

      // Flacon Jade Transformation
      if (liquidEl) {
        liquidEl.style.background = 'linear-gradient(180deg, #6EE7B7 0%, #10B981 45%, #065F46 100%)';
        liquidEl.style.boxShadow = 'inset 0 0 25px rgba(255, 255, 255, 0.45), 0 0 35px rgba(16, 185, 129, 0.6)';
        liquidEl.style.height = `${70 + Math.round(pTop * 0.15)}%`;
      }
      if (auraEl) {
        auraEl.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(52, 211, 153, 0.35) 50%, transparent 75%)';
      }

    } else if (pMid >= 42) {
      // HERITAGE DOMINANT (Imperial Liquid Gold Amber)
      currentDominantTheme = 'heritage';
      if (archetypeTagEl) archetypeTagEl.textContent = dict.persona_heritage_tag;
      if (personaTitleEl) personaTitleEl.textContent = dict.persona_heritage_title;
      if (personaDescEl) personaDescEl.textContent = dict.persona_heritage_desc;
      if (dominantBadgeEl) dominantBadgeEl.textContent = dict.persona_heritage_dom;

      if (meterFresh) meterFresh.textContent = `${Math.max(40, 65 - Math.round(pMid * 0.2))}/100`;
      if (meterWarm) meterWarm.textContent = `${Math.min(95, 65 + Math.round(pMid * 0.3))}/100`;
      if (meterLongevity) meterLongevity.textContent = `10 – 14 ${hr}`;

      // Flacon Gold Transformation
      if (liquidEl) {
        liquidEl.style.background = 'linear-gradient(180deg, #FEF08A 0%, #D4AF37 45%, #92400E 100%)';
        liquidEl.style.boxShadow = 'inset 0 0 25px rgba(255, 255, 255, 0.45), 0 0 35px rgba(212, 175, 55, 0.7)';
        liquidEl.style.height = `${70 + Math.round(pMid * 0.15)}%`;
      }
      if (auraEl) {
        auraEl.style.background = 'radial-gradient(circle, rgba(212, 175, 55, 0.85) 0%, rgba(245, 158, 11, 0.35) 50%, transparent 75%)';
      }

    } else if (pBase >= 42) {
      // MEMORY DOMINANT (Sacred Lacquer Crimson & Agarwood)
      currentDominantTheme = 'memory';
      if (archetypeTagEl) archetypeTagEl.textContent = dict.persona_memory_tag;
      if (personaTitleEl) personaTitleEl.textContent = dict.persona_memory_title;
      if (personaDescEl) personaDescEl.textContent = dict.persona_memory_desc;
      if (dominantBadgeEl) dominantBadgeEl.textContent = dict.persona_memory_dom;

      if (meterFresh) meterFresh.textContent = `${Math.max(25, 50 - Math.round(pBase * 0.3))}/100`;
      if (meterWarm) meterWarm.textContent = `${Math.min(99, 75 + Math.round(pBase * 0.3))}/100`;
      if (meterLongevity) meterLongevity.textContent = `12 – 16 ${hr}`;

      // Flacon Crimson Transformation
      if (liquidEl) {
        liquidEl.style.background = 'linear-gradient(180deg, #FCA5A5 0%, #B91C1C 45%, #450A0A 100%)';
        liquidEl.style.boxShadow = 'inset 0 0 25px rgba(255, 255, 255, 0.45), 0 0 35px rgba(139, 30, 30, 0.8)';
        liquidEl.style.height = `${70 + Math.round(pBase * 0.15)}%`;
      }
      if (auraEl) {
        auraEl.style.background = 'radial-gradient(circle, rgba(139, 30, 30, 0.85) 0%, rgba(220, 38, 38, 0.35) 50%, transparent 75%)';
      }

    } else {
      // BALANCED HARMONY (Tri-color Layered Nectar)
      currentDominantTheme = 'balanced';
      if (archetypeTagEl) archetypeTagEl.textContent = dict.persona_balanced_tag;
      if (personaTitleEl) personaTitleEl.textContent = dict.persona_balanced_title;
      if (personaDescEl) personaDescEl.textContent = dict.persona_balanced_desc;
      if (dominantBadgeEl) dominantBadgeEl.textContent = dict.persona_balanced_dom;

      if (meterFresh) meterFresh.textContent = '72/100';
      if (meterWarm) meterWarm.textContent = '68/100';
      if (meterLongevity) meterLongevity.textContent = `8 – 12 ${hr}`;

      // Flacon Tri-color Layered Transformation
      if (liquidEl) {
        liquidEl.style.background = 'linear-gradient(180deg, #A7F3D0 0%, #F5D061 40%, #8B1E1E 100%)';
        liquidEl.style.boxShadow = 'inset 0 0 25px rgba(255, 255, 255, 0.45), 0 0 35px rgba(212, 175, 55, 0.6)';
        liquidEl.style.height = '78%';
      }
      if (auraEl) {
        auraEl.style.background = 'radial-gradient(circle, rgba(212, 175, 55, 0.75) 0%, rgba(16, 185, 129, 0.25) 45%, rgba(139, 30, 30, 0.2) 75%)';
      }
    }

    // Generate Scent ID
    const formulaCode = `INDEP-1975-B${pTop}D${pMid}K${pBase}`;
    if (scentIdEl) scentIdEl.textContent = formulaCode;
    window.currentScentFormula = {
      top: pTop,
      mid: pMid,
      base: pBase,
      id: formulaCode,
      theme: currentDominantTheme
    };

    if (formScentFormula) {
      formScentFormula.value = `${formulaCode} (${pTop}% Bình Minh - ${pMid}% Di Sản - ${pBase}% Ký Ức)`;
    }
  }

  // Sliders Input Listeners
  [sliderTop, sliderMid, sliderBase].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', () => {
        // Remove active from presets when user manually tweaks
        presetBtns.forEach(p => p.classList.remove('active'));
        updateMixer();
      });
    }
  });

  // Preset Buttons Click Listeners
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const topVal = parseInt(btn.dataset.top, 10);
      const midVal = parseInt(btn.dataset.mid, 10);
      const baseVal = parseInt(btn.dataset.base, 10);

      sliderTop.value = topVal;
      sliderMid.value = midVal;
      sliderBase.value = baseVal;

      soundscape.playChime();
      updateMixer();
      showNotificationToast(`Đã chọn phong cách: ${btn.textContent.trim()}`);
    });
  });

  // Sync engraved name between mixer bottle and booking input
  if (bookingEngraveInput) {
    bookingEngraveInput.addEventListener('input', (e) => {
      const name = e.target.value.trim().toUpperCase() || 'HƯƠNG TỰ DO';
      if (bottleNameEl) bottleNameEl.textContent = name;
      const previewOnTicket = document.getElementById('ticket-engraved-preview');
      if (previewOnTicket) previewOnTicket.textContent = name;
    });
  }

  // Test Spray Button with Dynamic Mist Colors
  if (sprayBtn) {
    sprayBtn.addEventListener('click', () => {
      soundscape.playSpraySound();
      createColoredMist(currentDominantTheme);
      const activeLang = document.documentElement.lang || 'vi';
      const dict = translations[activeLang] || translations.vi;
      showNotificationToast(dict.toast_spray || "Làn sương hương thơm tinh tế đang lan tỏa...");
    });
  }

  function createColoredMist(theme) {
    const mistContainer = document.getElementById('perfume-mist-effect');
    if (!mistContainer) return;
    mistContainer.innerHTML = '';
    mistContainer.classList.add('active');

    // Tactile flacon cap nozzle depression
    const cap = document.querySelector('.flacon-cap');
    if (cap) {
      cap.classList.add('pressing');
      setTimeout(() => cap.classList.remove('pressing'), 160);
    }

    // Ambient aura glow pulse
    if (auraEl) {
      auraEl.classList.remove('spray-aura-pulse');
      void auraEl.offsetWidth; // trigger reflow
      auraEl.classList.add('spray-aura-pulse');
      setTimeout(() => auraEl.classList.remove('spray-aura-pulse'), 1200);
    }

    // Palette configuration based on active theme
    let vaporColor = 'rgba(255, 250, 220, 0.7)';
    let dropletCore = 'rgba(255, 255, 255, 0.98)';
    let dropletEdge = 'rgba(212, 175, 55, 0.65)';
    let sparkleColor = '#FDF0CD';

    if (theme === 'dawn') {
      vaporColor = 'rgba(167, 243, 208, 0.75)';
      dropletCore = 'rgba(209, 250, 229, 0.98)';
      dropletEdge = 'rgba(16, 185, 129, 0.7)';
      sparkleColor = '#A7F3D0';
    } else if (theme === 'heritage') {
      vaporColor = 'rgba(254, 240, 138, 0.75)';
      dropletCore = 'rgba(255, 255, 255, 0.98)';
      dropletEdge = 'rgba(212, 175, 55, 0.8)';
      sparkleColor = '#FFE27D';
    } else if (theme === 'memory') {
      vaporColor = 'rgba(254, 202, 202, 0.75)';
      dropletCore = 'rgba(254, 226, 226, 0.98)';
      dropletEdge = 'rgba(220, 38, 38, 0.75)';
      sparkleColor = '#FCA5A5';
    }

    // 1. Billowing Vapor Puffs (3 expanding soft clouds)
    for (let i = 0; i < 3; i++) {
      const puff = document.createElement('div');
      puff.className = 'mist-vapor-puff';
      const size = 38 + i * 16;
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.background = `radial-gradient(circle, ${vaporColor} 0%, rgba(255, 255, 255, 0.25) 45%, transparent 75%)`;
      puff.style.setProperty('--vx', `${(i - 1) * 22}px`);
      puff.style.animationDelay = `${i * 0.06}s`;
      mistContainer.appendChild(puff);
    }

    // 2. Fine Atomized Micro-Droplets (36 silky particles shooting upwards in cone)
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'mist-micro-droplet';
      const spreadX = (Math.random() - 0.5) * 110; // -55px to +55px
      const shootY = -(70 + Math.random() * 125);   // -70px to -195px
      const delay = Math.random() * 0.12;
      const size = 3 + Math.random() * 5.5; // fine micro size

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = `radial-gradient(circle, ${dropletCore} 20%, ${dropletEdge} 75%, transparent 100%)`;
      p.style.boxShadow = `0 0 6px ${dropletEdge}`;
      p.style.setProperty('--tx', `${spreadX}px`);
      p.style.setProperty('--ty', `${shootY}px`);
      p.style.animationDelay = `${delay}s`;
      mistContainer.appendChild(p);
    }

    // 3. Olfactory Crystalline Sparkles (8 glistening stars)
    const sparkleGlyphs = ['✦', '✧', '⋆', '✦'];
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement('div');
      sp.className = 'mist-glint';
      sp.textContent = sparkleGlyphs[i % sparkleGlyphs.length];
      const spreadX = (Math.random() - 0.5) * 90;
      const shootY = -(90 + Math.random() * 110);
      const delay = 0.04 + Math.random() * 0.18;

      sp.style.color = sparkleColor;
      sp.style.textShadow = `0 0 10px ${sparkleColor}, 0 0 16px rgba(255,255,255,0.8)`;
      sp.style.setProperty('--tx', `${spreadX}px`);
      sp.style.setProperty('--ty', `${shootY}px`);
      sp.style.animationDelay = `${delay}s`;
      mistContainer.appendChild(sp);
    }

    setTimeout(() => {
      mistContainer.classList.remove('active');
    }, 1300);
  }

  // Apply to ticket booking form
  if (applyFormulaBtn) {
    applyFormulaBtn.addEventListener('click', () => {
      soundscape.playChime();
      const bookingSection = document.getElementById('section-booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
      const activeLang = document.documentElement.lang || 'vi';
      const dict = translations[activeLang] || translations.vi;
      const tmpl = dict.toast_formula_saved || "Đã lưu công thức [{id}] vào thông tin đặt vé!";
      showNotificationToast(tmpl.replace('{id}', window.currentScentFormula.id));
    });
  }

  // Re-render mixer texts when language changes
  window.addEventListener('languageChanged', () => {
    updateMixer();
  });

  // Initial trigger
  updateMixer();
}
