import { translations } from './translations.js';
import { soundscape } from './audio.js';
import { initScrollytelling, showNotificationToast } from './scrollytelling.js';
import { initPerfumeMixer } from './perfume-mixer.js';
import { initBookingEngine } from './booking.js';

let currentLang = 'vi';

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

  // Also update HTML lang attribute
  document.documentElement.lang = lang;
}

// Audio Bar & Visualizer
function initAudioToggle() {
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const soundWaves = document.getElementById('sound-waves-indicator');
  const audioStatusText = document.getElementById('audio-status-text');

  if (!audioToggleBtn) return;

  audioToggleBtn.addEventListener('click', async () => {
    const isPlaying = await soundscape.toggle();

    if (isPlaying) {
      audioToggleBtn.classList.add('playing');
      if (soundWaves) soundWaves.classList.add('active');
      if (audioStatusText) audioStatusText.textContent = 'Đang phát: Jazz Sài Gòn & Radio 70s';
      showNotificationToast('Đã bật không gian âm thanh Jazz & Radio hoài niệm thập niên 70');
    } else {
      audioToggleBtn.classList.remove('playing');
      if (soundWaves) soundWaves.classList.remove('active');
      if (audioStatusText) audioStatusText.textContent = 'Âm thanh: Đang tắt';
      showNotificationToast('Đã tắt âm thanh không gian');
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

  const script = [
    { time: 0, text: "Tháng 4 năm 1975... Thời khắc chuyển giao của lịch sử." },
    { time: 4, text: "Di tích Quốc gia Đặc biệt Dinh Độc Lập thắp sáng trong đêm." },
    { time: 8, text: "Tiếng rền của khói lửa, tiếng còi xe tăng, âm vang hòa bình." },
    { time: 13, text: "Hương hoa sen, trà xanh và khói trầm lưu giữ tự do." },
    { time: 17, text: "HƯƠNG ĐỘC LẬP – Lưu giữ tự do trong từng giác quan." }
  ];

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
      showNotificationToast('Vui lòng nhập mã Scent ID để tra cứu!');
      return;
    }

    soundscape.playChime();
    refillResult.style.display = 'block';
    refillResult.innerHTML = `
      <div class="refill-found-box">
        <div class="refill-status-badge">✦ CÔNG THỨC HỢP LỆ TRONG KHO LƯU TRỮ DINH ĐỘC LẬP</div>
        <h4>Mã Scent ID: <span class="gold-text">${code}</span></h4>
        <p class="refill-desc">Công thức gốc lưu trữ: <strong>35% Sen Bách Diệp & Nhài Đêm</strong> • <strong>45% Cỏ Hương Bài & Đàn Hương</strong> • <strong>20% Khói Trầm Hoàng Triều</strong>.</p>
        <div class="refill-action-row">
          <button class="gold-btn btn-sm" onclick="alert('Đã thêm 01 chai Refill 50ml (${code}) vào giỏ quà tặng! Bộ phận Chăm sóc Di sản sẽ liên hệ quý khách.')">ĐẶT REFILL CHAI 50ML (850.000 VNĐ)</button>
          <button class="ghost-btn btn-sm" onclick="alert('Mã quà tặng số hóa cho bạn bè đã được gửi tới email liên kết!')">GỬI TẶNG BẠN BÈ (GIFT CARD)</button>
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
