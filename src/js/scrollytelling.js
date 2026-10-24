import { soundscape } from './audio.js';

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
      { time: "17:45 – 18:00", dur: "15 Phút" },
      { time: "18:00 – 18:20", dur: "20 Phút" },
      { time: "18:20 – 18:50", dur: "30 Phút" },
      { time: "18:50 – 19:10", dur: "20 Phút" },
      { time: "19:10 – 20:00", dur: "50 Phút" }
    ],
    shift2: [
      { time: "20:15 – 20:30", dur: "15 Phút" },
      { time: "20:30 – 20:50", dur: "20 Phút" },
      { time: "20:50 – 21:20", dur: "30 Phút" },
      { time: "21:20 – 21:40", dur: "20 Phút" },
      { time: "21:40 – 22:30", dur: "50 Phút" }
    ]
  };

  shiftBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      shiftBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const shiftKey = btn.dataset.shift;
      
      currentShiftText.forEach((el, idx) => {
        if (shiftTimes[shiftKey] && shiftTimes[shiftKey][idx]) {
          el.innerHTML = `<span>⏳ ${shiftTimes[shiftKey][idx].time}</span> <span class="badge-dur">(${shiftTimes[shiftKey][idx].dur})</span>`;
        }
      });
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

    if (stampBtn) {
      stampBtn.classList.add('stamped');
      stampBtn.innerHTML = `✓ ${stampBtn.dataset.stampedText || 'ĐÃ ĐÓNG DẤU MỘC'}`;
    }

    if (digitalStamp) {
      digitalStamp.classList.add('stamped');
    }

    window.passportState[`stamp${stationNum}`] = true;
    updatePassportCounter();

    // Trigger visual notification
    showNotificationToast(`Đã đóng Dấu mộc số ${stationNum} vào Hộ Chiếu Độc Lập!`);
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
