import { translations } from './translations.js';
import { soundscape } from './audio.js';
import { initScrollytelling, showNotificationToast } from './scrollytelling.js';
import { initPerfumeMixer } from './perfume-mixer.js';
import { initBookingEngine } from './booking.js';

let currentLang = 'vi';

export function getCurrentLang() {
  return currentLang;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Sub-modules
  initScrollytelling();
  initPerfumeMixer();
  initBookingEngine();
  initLanguageSwitcher();
  initAudioToggle();
  initModals();
  initAccordion();
  initScentIdRefill();
  initSmoothScroll();
  initMobileMenu();
  soundscape.autoStart();
});

// Language Switcher
function initLanguageSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      applyLanguage(lang);
    });
  });
}

export function applyLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang] || translations.vi;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });

  // Update HTML lang attribute, title, and meta description
  document.documentElement.lang = lang;
  if (dict.meta_title) {
    document.title = dict.meta_title;
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict.meta_description) {
    metaDesc.content = dict.meta_description;
  }

  // Update audio status button label if present
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status-text');
  if (audioBtn && audioStatusText) {
    if (audioBtn.classList.contains('playing')) {
      audioStatusText.textContent = dict.audio_playing_text || 'Đang phát: Hoa Anh Đào Rơi Dịu Dàng (NOQURA)';
    } else {
      audioStatusText.textContent = dict.audio_label || 'Âm thanh Không gian';
    }
  }

  // Dispatch event for other reactive modules
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, dict } }));
}

// Audio Bar & Visualizer
function initAudioToggle() {
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (!audioToggleBtn) return;

  audioToggleBtn.addEventListener('click', async () => {
    const isPlaying = await soundscape.toggle();
    const dict = translations[currentLang] || translations.vi;

    if (isPlaying) {
      showNotificationToast(dict.toast_audio_on || 'Đang phát: Hoa Anh Đào Rơi Dịu Dàng (NOQURA)');
    } else {
      showNotificationToast(dict.toast_audio_off || 'Đã tắt âm thanh không gian');
    }
  });
}

// Modal handling
function initModals() {
  // Trailer Modal
  const trailerBtn = document.getElementById('btn-open-trailer');
  const trailerModal = document.getElementById('trailer-modal');
  const closeTrailerBtn = document.getElementById('btn-close-trailer');

  if (trailerBtn && trailerModal) {
    trailerBtn.addEventListener('click', () => {
      trailerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Play trailer simulation
      startTrailerSimulation();
    });
  }

  if (closeTrailerBtn && trailerModal) {
    closeTrailerBtn.addEventListener('click', () => {
      trailerModal.classList.remove('active');
      document.body.style.overflow = '';
      stopTrailerSimulation();
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.heritage-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close-icon')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        stopTrailerSimulation();
      }
    });
  });

  // Digital Passport floating quick-view button
  const openPassportDrawerBtn = document.getElementById('btn-view-passport-drawer');
  const passportDrawerModal = document.getElementById('passport-drawer-modal');
  if (openPassportDrawerBtn && passportDrawerModal) {
    openPassportDrawerBtn.addEventListener('click', () => {
      passportDrawerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
}

// Trailer Simulation with atmospheric video canvas & audio
let trailerInterval = null;
function startTrailerSimulation() {
  const videoOverlay = document.getElementById('trailer-screen-subtitles');
  if (!videoOverlay) return;

  const scriptsByLang = {
    vi: [
      { time: 0, text: "Tháng 4 năm 1975... Thời khắc chuyển giao của lịch sử." },
      { time: 4, text: "Di tích Quốc gia Đặc biệt Dinh Độc Lập thắp sáng trong đêm." },
      { time: 8, text: "Tiếng rền của khói lửa, tiếng còi xe tăng, âm vang hòa bình." },
      { time: 13, text: "Hương hoa sen, trà xanh và khói trầm lưu giữ tự do." },
      { time: 17, text: "HƯƠNG ĐỘC LẬP – Lưu giữ tự do trong từng giác quan." }
    ],
    en: [
      { time: 0, text: "April 1975... A momentous turning point in history." },
      { time: 4, text: "Independence Palace illuminated in the nocturnal splendor of Saigon." },
      { time: 8, text: "Echoes of martial fire, the historic breakthrough, dawn of peace." },
      { time: 13, text: "Bespoke notes of sacred lotus, royal woods, and eternal incense." },
      { time: 17, text: "SCENT OF INDEPENDENCE – Preserving freedom in every awakened sense." }
    ],
    fr: [
      { time: 0, text: "Avril 1975... Le tournant décisif de l'Histoire." },
      { time: 4, text: "Le Palais de l'Indépendance s'illumine dans la nuit saïgonnaise." },
      { time: 8, text: "Fracas des combats, chars franchissant les grilles, aube de paix." },
      { time: 13, text: "Effluves de lotus blanc, thé vert et encens sacré de la liberté." },
      { time: 17, text: "PARFUM D'INDÉPENDANCE – Éveillez vos sens au cœur de la liberté." }
    ]
  };

  const script = scriptsByLang[currentLang] || scriptsByLang.vi;

  let sec = 0;
  videoOverlay.textContent = script[0].text;
  trailerInterval = setInterval(() => {
    sec++;
    const current = script.slice().reverse().find(s => sec >= s.time);
    if (current) {
      videoOverlay.textContent = current.text;
    }
    if (sec >= 22) {
      sec = 0;
    }
  }, 1000);
}

function stopTrailerSimulation() {
  if (trailerInterval) {
    clearInterval(trailerInterval);
    trailerInterval = null;
  }
}

// Accordion (Know before you go)
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(it => {
        it.classList.remove('active');
      });

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// CRM Scent ID Refill Look up
function initScentIdRefill() {
  const refillInput = document.getElementById('refill-scent-input');
  const refillBtn = document.getElementById('btn-refill-lookup');
  const refillResult = document.getElementById('refill-result-card');

  if (!refillBtn || !refillInput || !refillResult) return;

  refillBtn.addEventListener('click', () => {
    const code = refillInput.value.trim().toUpperCase();
    if (!code) {
      const emptyMsg = currentLang === 'en' 
        ? 'Please enter your Scent ID code!' 
        : (currentLang === 'fr' ? 'Veuillez saisir votre code Scent ID !' : 'Vui lòng nhập mã Scent ID để tra cứu!');
      showNotificationToast(emptyMsg);
      return;
    }

    soundscape.playChime();
    refillResult.style.display = 'block';

    const refillTexts = {
      vi: {
        badge: "✦ CÔNG THỨC HỢP LỆ TRONG KHO LƯU TRỮ DINH ĐỘC LẬP",
        desc: "Công thức gốc lưu trữ: <strong>35% Sen Bách Diệp & Nhài Đêm</strong> • <strong>45% Cỏ Hương Bài & Đàn Hương</strong> • <strong>20% Khói Trầm Hoàng Triều</strong>.",
        btnOrder: "ĐẶT REFILL CHAI 50ML (850.000 VNĐ)",
        btnGift: "GỬI TẶNG BẠN BÈ (GIFT CARD)",
        alertOrder: `Đã thêm 01 chai Refill 50ml (${code}) vào giỏ quà tặng! Bộ phận Chăm sóc Di sản sẽ liên hệ quý khách.`,
        alertGift: "Mã quà tặng số hóa cho bạn bè đã được gửi tới email liên kết!"
      },
      en: {
        badge: "✦ VALID ARCHIVED FORMULA IN INDEPENDENCE PALACE REGISTRY",
        desc: "Archived master formula: <strong>35% Sacred Lotus & Night Jasmine</strong> • <strong>45% Royal Vetiver & Mysore Sandalwood</strong> • <strong>20% Imperial Agarwood Smoke</strong>.",
        btnOrder: "ORDER 50ML REFILL FLACON ($35 USD)",
        btnGift: "SEND COMPLIMENTARY GIFT CARD",
        alertOrder: `Added 1x 50ml Refill (${code}) to gift cart! Heritage Concierge will contact you shortly.`,
        alertGift: "Digital gift card with QR code has been dispatched to your registered email!"
      },
      fr: {
        badge: "✦ FORMULE ARCHIVÉE OFFICIELLE AU REGISTRE DU PALAIS DE L'INDÉPENDANCE",
        desc: "Formule originale : <strong>35% Lotus Blanc & Jasmin</strong> • <strong>45% Vétiver & Santal de Mysore</strong> • <strong>20% Encens d'Oud Royal</strong>.",
        btnOrder: "COMMANDER LA RECHARGE 50ML (35 €)",
        btnGift: "OFFRIR EN CARTE CADEAU",
        alertOrder: `1 flacon recharge 50ml (${code}) ajouté au panier ! La conciergerie vous contactera sous peu.`,
        alertGift: "La carte cadeau numérique avec QR code a été envoyée par courriel !"
      }
    };

    const rt = refillTexts[currentLang] || refillTexts.vi;

    refillResult.innerHTML = `
      <div class="refill-found-box">
        <div class="refill-status-badge">${rt.badge}</div>
        <h4>Mã / Code Scent ID: <span class="gold-text">${code}</span></h4>
        <p class="refill-desc">${rt.desc}</p>
        <div class="refill-action-row">
          <button class="gold-btn btn-sm" onclick="alert('${rt.alertOrder}')">${rt.btnOrder}</button>
          <button class="ghost-btn btn-sm" onclick="alert('${rt.alertGift}')">${rt.btnGift}</button>
        </div>
      </div>
    `;
    refillResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// Smooth scroll for nav anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Mobile Menu Drawer Handler
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.toggle('active');
    toggleBtn.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close drawer on clicking any nav link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('active') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
