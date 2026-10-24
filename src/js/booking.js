import confetti from 'canvas-confetti';
import { soundscape } from './audio.js';
import { showNotificationToast } from './scrollytelling.js';

export function initBookingEngine() {
  const tierCards = document.querySelectorAll('.pricing-card');
  const tierSelect = document.getElementById('booking-tier-select');
  const dateSlots = document.querySelectorAll('.date-slot-pill');
  const shiftRadios = document.querySelectorAll('input[name="booking-shift"]');
  const seatCounterEl = document.getElementById('live-seats-remaining');
  const qtyInput = document.getElementById('booking-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  const subtotalEl = document.getElementById('price-subtotal');
  const discountEl = document.getElementById('price-discount');
  const totalEl = document.getElementById('price-total');
  const bookingForm = document.getElementById('booking-form');

  // State
  let currentTier = 'vip'; // default VIP
  let currentPricePerTicket = 2650000;
  let currentQuantity = 2;
  const discountRate = 0.15; // 15% Early Bird

  const tierPrices = {
    standard: { price: 1850000, name: 'Hạng Tiêu Chuẩn (Freedom Pass)' },
    vip: { price: 2650000, name: 'Hạng Thượng Hạng (Independence VIP)' },
    corporate: { price: 160000000, name: 'Gói Doanh Nghiệp (Charter B2B)' }
  };

  // Remaining seats simulated database for selected date & shift
  const seatMap = {
    'fri-1': 24,
    'fri-2': 38,
    'sat-1': 8,
    'sat-2': 14,
    'sun-1': 19,
    'sun-2': 42
  };

  function updateSeatCounter() {
    const selectedDate = document.querySelector('.date-slot-pill.selected');
    const selectedShift = document.querySelector('input[name="booking-shift"]:checked');
    if (!selectedDate || !selectedShift || !seatCounterEl) return;

    const dateKey = selectedDate.dataset.dayCode; // 'fri', 'sat', 'sun'
    const shiftKey = selectedShift.value; // '1', '2'
    const key = `${dateKey}-${shiftKey}`;
    const left = seatMap[key] || 16;

    seatCounterEl.innerHTML = `<span class="seat-pulse"></span> Chỉ còn <strong>${left}/100</strong> chỗ trống`;
  }

  function calculatePrices() {
    let subtotal = 0;
    if (currentTier === 'corporate') {
      subtotal = tierPrices.corporate.price;
    } else {
      subtotal = currentPricePerTicket * currentQuantity;
    }

    const discount = Math.round(subtotal * discountRate);
    const total = subtotal - discount;

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString('vi-VN')} VNĐ`;
    if (discountEl) discountEl.textContent = `-${discount.toLocaleString('vi-VN')} VNĐ (Early Bird 15%)`;
    if (totalEl) totalEl.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
  }

  // Tier Card Clicks
  tierCards.forEach(card => {
    const selectBtn = card.querySelector('.btn-select-tier');
    if (selectBtn) {
      selectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const tier = card.dataset.tier;
        setTier(tier);
        const bookingSection = document.getElementById('section-booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });

  function setTier(tier) {
    currentTier = tier;
    if (tierPrices[tier]) {
      currentPricePerTicket = tierPrices[tier].price;
    }
    if (tierSelect) {
      tierSelect.value = tier;
    }
    tierCards.forEach(c => {
      if (c.dataset.tier === tier) c.classList.add('selected');
      else c.classList.remove('selected');
    });

    // If corporate, disable quantity buttons
    if (tier === 'corporate') {
      if (qtyInput) qtyInput.value = 1;
      currentQuantity = 1;
      if (qtyMinus) qtyMinus.disabled = true;
      if (qtyPlus) qtyPlus.disabled = true;
    } else {
      if (qtyMinus) qtyMinus.disabled = false;
      if (qtyPlus) qtyPlus.disabled = false;
    }

    calculatePrices();
  }

  if (tierSelect) {
    tierSelect.addEventListener('change', (e) => {
      setTier(e.target.value);
    });
  }

  // Quantity +/-
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      if (currentTier === 'corporate') return;
      let val = parseInt(qtyInput.value, 10);
      if (val > 1) {
        val--;
        qtyInput.value = val;
        currentQuantity = val;
        calculatePrices();
      }
    });

    qtyPlus.addEventListener('click', () => {
      if (currentTier === 'corporate') return;
      let val = parseInt(qtyInput.value, 10);
      if (val < 20) {
        val++;
        qtyInput.value = val;
        currentQuantity = val;
        calculatePrices();
      }
    });
  }

  // Date Slot Selection
  dateSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      dateSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      updateSeatCounter();
    });
  });

  shiftRadios.forEach(radio => {
    radio.addEventListener('change', updateSeatCounter);
  });

  // Initial calculations
  setTier('vip');
  updateSeatCounter();

  // Form Submit
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('booking-fullname')?.value || 'Quý Khách';
      const phone = document.getElementById('booking-phone')?.value || '';
      const email = document.getElementById('booking-email')?.value || '';
      const engravedName = document.getElementById('booking-engraved-name')?.value || 'HƯƠNG TỰ DO';
      const selectedDate = document.querySelector('.date-slot-pill.selected')?.dataset.dateString || 'Thứ Sáu tới';
      const selectedShift = document.querySelector('input[name="booking-shift"]:checked')?.value === '1' ? 'Suất 1 (18:00 – 20:00)' : 'Suất 2 (20:30 – 22:30)';
      const is24hHold = document.getElementById('booking-hold-24h')?.checked;

      soundscape.playChime();

      // Confetti burst
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#8B1E1E', '#F5EEDC', '#FFFFFF']
      });

      // Display Independence Passport & Ticket Modal
      showPassportTicketModal({
        fullName,
        phone,
        email,
        engravedName: engravedName.toUpperCase(),
        date: selectedDate,
        shift: selectedShift,
        tierName: tierPrices[currentTier].name,
        quantity: currentQuantity,
        scentId: window.currentScentFormula?.id || 'INDEP-1975-B35D45K20',
        isHold: is24hHold
      });
    });
  }
}

// Digital Passport & Ticket Modal
export function showPassportTicketModal(data) {
  const modal = document.getElementById('passport-ticket-modal');
  if (!modal) return;

  const ticketCode = `INDEP-1975-${Math.floor(1000 + Math.random() * 9000)}`;

  modal.querySelector('#modal-ticket-code').textContent = ticketCode;
  modal.querySelector('#modal-guest-name').textContent = data.fullName;
  modal.querySelector('#modal-tier-badge').textContent = data.tierName;
  modal.querySelector('#modal-event-date').textContent = data.date;
  modal.querySelector('#modal-event-shift').textContent = data.shift;
  modal.querySelector('#modal-perfume-engraved').textContent = data.engravedName;
  modal.querySelector('#modal-scent-id').textContent = data.scentId;
  modal.querySelector('#modal-qty-seats').textContent = `${data.quantity} Vé`;

  const holdBadge = modal.querySelector('#modal-hold-badge');
  if (holdBadge) {
    if (data.isHold) {
      holdBadge.style.display = 'inline-block';
      holdBadge.textContent = '⏳ Giữ chỗ 24h đang kích hoạt';
    } else {
      holdBadge.style.display = 'none';
    }
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
