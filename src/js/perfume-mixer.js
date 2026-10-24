import { soundscape } from './audio.js';
import { showNotificationToast } from './scrollytelling.js';

export function initPerfumeMixer() {
  const sliderTop = document.getElementById('slider-top');
  const sliderMid = document.getElementById('slider-mid');
  const sliderBase = document.getElementById('slider-base');

  const valTop = document.getElementById('val-top');
  const valMid = document.getElementById('val-mid');
  const valBase = document.getElementById('val-base');

  const liquidEl = document.getElementById('perfume-liquid-fill');
  const bottleNameEl = document.getElementById('bottle-engraved-name');
  const scentIdEl = document.getElementById('generated-scent-id');
  const sprayBtn = document.getElementById('btn-spray-test');
  const applyFormulaBtn = document.getElementById('btn-apply-formula');

  const bookingEngraveInput = document.getElementById('booking-engraved-name');
  const formScentFormula = document.getElementById('form-selected-formula');

  function updateMixer() {
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

    // Dynamic color shift based on proportions:
    // Dawn is fresh golden green/lotus white: rgba(220, 200, 120, ...)
    // Heritage is rich golden amber: rgba(212, 175, 55, ...)
    // Memory is deep smoky red/brown lacquer: rgba(139, 30, 30, ...)
    const r = Math.round((pTop * 210 + pMid * 212 + pBase * 140) / 100);
    const g = Math.round((pTop * 195 + pMid * 175 + pBase * 45) / 100);
    const b = Math.round((pTop * 140 + pMid * 55 + pBase * 40) / 100);

    if (liquidEl) {
      liquidEl.style.background = `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.5) 0%, rgba(${r-20}, ${g-25}, ${b-15}, 0.85) 100%)`;
      liquidEl.style.boxShadow = `inset 0 0 25px rgba(${r}, ${g}, ${b}, 0.5), 0 0 20px rgba(${r}, ${g}, ${b}, 0.3)`;
    }

    // Generate Scent ID
    const formulaCode = `INDEP-1975-B${pTop}D${pMid}K${pBase}`;
    if (scentIdEl) scentIdEl.textContent = formulaCode;
    window.currentScentFormula = {
      top: pTop,
      mid: pMid,
      base: pBase,
      id: formulaCode
    };

    if (formScentFormula) {
      formScentFormula.value = `${formulaCode} (${pTop}% Bình Minh - ${pMid}% Di Sản - ${pBase}% Ký Ức)`;
    }
  }

  [sliderTop, sliderMid, sliderBase].forEach(slider => {
    if (slider) slider.addEventListener('input', updateMixer);
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

  // Test Spray Button
  if (sprayBtn) {
    sprayBtn.addEventListener('click', () => {
      soundscape.playSpraySound();
      createMistParticles();
      showNotificationToast("Làn sương hương sen, nhài và khói trầm đang lan tỏa...");
    });
  }

  function createMistParticles() {
    const mistContainer = document.getElementById('perfume-mist-effect');
    if (!mistContainer) return;
    mistContainer.innerHTML = '';
    mistContainer.classList.add('active');

    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'mist-particle';
      const angle = (Math.random() - 0.5) * 60; // spray cone
      const dist = 60 + Math.random() * 120;
      const delay = Math.random() * 0.15;
      const size = 6 + Math.random() * 18;
      
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.setProperty('--angle', `${angle}deg`);
      p.style.setProperty('--dist', `${dist}px`);
      p.style.animationDelay = `${delay}s`;
      mistContainer.appendChild(p);
    }

    setTimeout(() => {
      mistContainer.classList.remove('active');
    }, 1200);
  }

  // Apply to ticket booking form
  if (applyFormulaBtn) {
    applyFormulaBtn.addEventListener('click', () => {
      soundscape.playChime();
      const bookingSection = document.getElementById('section-booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
      showNotificationToast(`Đã lưu công thức [${window.currentScentFormula.id}] vào thông tin đặt vé!`);
    });
  }

  updateMixer();
}
