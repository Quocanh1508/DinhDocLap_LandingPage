import { soundscape } from './audio.js';
import { translations } from './translations.js';

export function initScrollytelling() {
  const progressBar = document.getElementById('bamboo-progress-bar');
  const stations = document.querySelectorAll('.journey-card');
  const mapNodes = document.querySelectorAll('.map-station-node');
  const routePath = document.getElementById('svg-route-path');
  const currentShiftText = document.querySelectorAll('.station-time-badge');
  const shiftBtns = document.querySelectorAll('.shift-toggle-btn');
  const passportStamp1 = document.getElementById('passport-stamp-1');
  const passportStamp2 = document.getElementById('passport-stamp-2');
  const passportStamp3 = document.getElementById('passport-stamp-3');

  // Track stamped status
  window.passportState = {
    stamp1: false,
    stamp2: false,
    stamp3: false
  };

  // 1. Scroll progress bar
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });

  // 2. Shift Toggle logic (Show 1 vs Show 2)
  const shiftTimes = {
    shift1: [
      { time: "17:45 – 18:00", durMins: 15 },
      { time: "18:00 – 18:20", durMins: 20 },
      { time: "18:20 – 18:50", durMins: 30 },
      { time: "18:50 – 19:10", durMins: 20 },
      { time: "19:10 – 20:00", durMins: 50 }
    ],
    shift2: [
      { time: "20:15 – 20:30", durMins: 15 },
      { time: "20:30 – 20:50", durMins: 20 },
      { time: "20:50 – 21:20", durMins: 30 },
      { time: "21:20 – 21:40", durMins: 20 },
      { time: "21:40 – 22:30", durMins: 50 }
    ]
  };

  let activeShift = 'shift1';

  function renderShiftTimes() {
    const activeLang = document.documentElement.lang || 'vi';
    const minUnit = activeLang === 'en' ? 'Mins' : (activeLang === 'fr' ? 'Min' : 'Phút');

    currentShiftText.forEach((el, idx) => {
      if (shiftTimes[activeShift] && shiftTimes[activeShift][idx]) {
        const item = shiftTimes[activeShift][idx];
        el.innerHTML = `<span>⏳ ${item.time}</span> <span class="badge-dur">(${item.durMins} ${minUnit})</span>`;
      }
    });
  }

  shiftBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      shiftBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShift = btn.dataset.shift;
      renderShiftTimes();
    });
  });

  // Re-render when language changes
  window.addEventListener('languageChanged', () => {
    renderShiftTimes();

    // Update stamped button text
    const activeLang = document.documentElement.lang || 'vi';
    const dict = translations[activeLang] || translations.vi;
    [1, 2, 3].forEach(num => {
      const btn = document.getElementById(`stamp-btn-${num}`);
      if (btn && btn.classList.contains('stamped')) {
        btn.innerHTML = `✓ ${dict.stamped_done || 'ĐÃ ĐÓNG DẤU MỘC'}`;
      }
    });
  });

  // 3. SVG Route Path animation calculation
  let totalPathLength = 0;
  if (routePath) {
    totalPathLength = routePath.getTotalLength();
    routePath.style.strokeDasharray = totalPathLength;
    routePath.style.strokeDashoffset = totalPathLength;
  }

  // 4. Stamping Function
  window.triggerStamp = function(stationNum, autoScrolled = false) {
    const stampEl = document.getElementById(`stamp-seal-${stationNum}`);
    const stampBtn = document.getElementById(`stamp-btn-${stationNum}`);
    const digitalStamp = document.getElementById(`digital-stamp-${stationNum}`);
    
    if (!stampEl || stampEl.classList.contains('stamped')) return;

    soundscape.playStampSound();
    stampEl.classList.add('stamped');

    const activeLang = document.documentElement.lang || 'vi';
    const dict = translations[activeLang] || translations.vi;

    if (stampBtn) {
      stampBtn.classList.add('stamped');
      stampBtn.innerHTML = `✓ ${dict.stamped_done || 'ĐÃ ĐÓNG DẤU MỘC'}`;
    }

    if (digitalStamp) {
      digitalStamp.classList.add('stamped');
    }

    window.passportState[`stamp${stationNum}`] = true;
    updatePassportCounter();

    // Trigger visual notification
    const stampNotice = activeLang === 'en' 
      ? `Official Seal No. ${stationNum} imprinted into your Independence Passport!` 
      : (activeLang === 'fr' 
          ? `Sceau officiel N° ${stationNum} apposé sur votre Passeport d'Indépendance !` 
          : `Đã đóng Dấu mộc số ${stationNum} vào Hộ Chiếu Độc Lập!`);
    showNotificationToast(stampNotice);
  };

  function updatePassportCounter() {
    const counterEl = document.getElementById('passport-count-badge');
    const count = Object.values(window.passportState).filter(Boolean).length;
    if (counterEl) {
      counterEl.textContent = `${count}/3`;
      if (count === 3) {
        counterEl.classList.add('all-collected');
      }
    }
  }

  // 5. IntersectionObserver for Timeline Stations & SVG Map Route
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -40% 0px",
    threshold: 0.2
  };

  const stationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stationIdx = parseInt(entry.target.dataset.stationIndex, 10);
        
        // Highlight active station card
        stations.forEach(s => s.classList.remove('is-active'));
        entry.target.classList.add('is-active');

        // Highlight map node
        mapNodes.forEach(node => {
          if (parseInt(node.dataset.stationIndex, 10) === stationIdx) {
            node.classList.add('active');
          } else if (parseInt(node.dataset.stationIndex, 10) < stationIdx) {
            node.classList.add('completed');
            node.classList.remove('active');
          } else {
            node.classList.remove('active', 'completed');
          }
        });

        // Advance route line on SVG map
        if (routePath && totalPathLength > 0) {
          const ratio = (stationIdx + 1) / 5;
          routePath.style.strokeDashoffset = totalPathLength * (1 - ratio);
        }

        // Auto stamp when scrolling through stations with stamps
        if (entry.target.dataset.stampNumber) {
          const stampNum = entry.target.dataset.stampNumber;
          // Auto stamp after 600ms view
          setTimeout(() => {
            if (!window.passportState[`stamp${stampNum}`]) {
              window.triggerStamp(stampNum, true);
            }
          }, 600);
        }
      }
    });
  }, observerOptions);

  stations.forEach(st => stationObserver.observe(st));

  // Map node click to scroll to station
  mapNodes.forEach(node => {
    node.addEventListener('click', () => {
      const idx = node.dataset.stationIndex;
      const targetCard = document.querySelector(`.journey-card[data-station-index="${idx}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Manual stamp buttons
  document.querySelectorAll('.manual-stamp-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const stampNum = btn.dataset.stampNumber;
      window.triggerStamp(stampNum, false);
    });
  });
}

// Notification Toast
export function showNotificationToast(msg) {
  let toast = document.getElementById('heritage-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'heritage-toast';
    toast.className = 'heritage-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-seal">✦</span> <span>${msg}</span>`;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
