// ==========================================================================
// Configurations & Consts
// ==========================================================================
const TARGET_DATE = new Date('2026-07-06T17:00:00'); // Event start time
const START_DATE = new Date('2026-07-04T00:00:00');  // Progress base start time
const EVENT_LOCATION = '12호관 302호';

// Mock participants to show if local storage is empty
const MOCK_PARTICIPANTS = [
  { name: '김민수', dept: '컴퓨터공학과', time: '10분 전' },
  { name: '박지현', dept: '소프트웨어학과', time: '1시간 전' },
  { name: '이도현', dept: '인공지능전공', time: '2시간 전' }
];

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCalendar();
  initGallery();
  initMapAndLocation();
  initRSVP();
  initSharing();
});

// ==========================================================================
// Helper: Show Toast Notification
// ==========================================================================
function showToast(message) {
  // Check if toast already exists, otherwise create it
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ==========================================================================
// Countdown Timer Logic
// ==========================================================================
function initCountdown() {
  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');
  const progressEl = document.getElementById('countdown-progress');
  const targetDescEl = document.getElementById('target-date-string');

  // Format date text dynamically
  const daysKor = ['일', '월', '화', '수', '목', '금', '토'];
  const month = TARGET_DATE.getMonth() + 1;
  const date = TARGET_DATE.getDate();
  const day = daysKor[TARGET_DATE.getDay()];
  const hours = TARGET_DATE.getHours();
  const min = TARGET_DATE.getMinutes();
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHour = hours % 12 || 12;
  const formattedMinutes = min < 10 ? '0' + min : min;
  
  targetDescEl.textContent = `${month}월 ${date}일(${day}) ${ampm} ${displayHour}:${formattedMinutes} 시작`;

  function updateTimer() {
    const now = new Date();
    const totalDuration = TARGET_DATE.getTime() - START_DATE.getTime();
    const remainingTime = TARGET_DATE.getTime() - now.getTime();

    if (remainingTime <= 0) {
      dEl.textContent = '00';
      hEl.textContent = '00';
      mEl.textContent = '00';
      sEl.textContent = '00';
      progressEl.style.width = '100%';
      targetDescEl.textContent = '행사가 이미 시작되었습니다! 🎉';
      return;
    }

    // Calculations
    const daysVal = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hoursVal = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minsVal = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const secsVal = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Format numbers
    dEl.textContent = String(daysVal).padStart(2, '0');
    hEl.textContent = String(hoursVal).padStart(2, '0');
    mEl.textContent = String(minsVal).padStart(2, '0');
    sEl.textContent = String(secsVal).padStart(2, '0');

    // Progress Bar Calculation
    const elapsed = now.getTime() - START_DATE.getTime();
    const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    progressEl.style.width = `${percentage}%`;
  }

  // Initial call and set interval
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================================================
// Google Calendar Integration
// ==========================================================================
function initCalendar() {
  const gcalBtn = document.getElementById('btn-gcal');
  
  // Event details: 2026-07-06 17:00 ~ 2026-07-08 20:00 (KST) -> UTC is -9 hours
  // 2026-07-06 17:00:00 KST -> 2026-07-06 08:00:00 UTC
  // 2026-07-08 20:00:00 KST -> 2026-07-08 11:00:00 UTC
  const text = encodeURIComponent('\'AI 앱 제작소\' 비교과 수업');
  const details = encodeURIComponent('재미있고 유익한 수업이니 많은 참여 부탁드립니다. (3일간 진행)');
  const location = encodeURIComponent(EVENT_LOCATION);
  const dates = '20260706T080000Z/20260708T110000Z'; // UTC Format
  
  gcalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

// ==========================================================================
// Touch-Friendly Swipeable Gallery Logic
// ==========================================================================
function initGallery() {
  const slider = document.getElementById('gallery-slider');
  const wrapper = document.getElementById('slider-wrapper');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  let currentIndex = 0;
  const slideCount = slides.length;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let animationID = 0;

  // Set position based on index
  function updateSliderPosition() {
    wrapper.style.transform = `translateX(-${currentIndex * 33.3333}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateSliderPosition();
  }

  // Arrow Clicks
  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Dot Clicks
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Touch Events for Mobile Swipe
  wrapper.addEventListener('touchstart', touchStart);
  wrapper.addEventListener('touchend', touchEnd);
  wrapper.addEventListener('touchmove', touchMove);

  function touchStart(event) {
    startX = event.touches[0].clientX;
    isDragging = true;
    animationID = requestAnimationFrame(animation);
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentX = event.touches[0].clientX;
    const diff = currentX - startX;
    // Limit translate value logic
    currentTranslate = prevTranslate + diff;
  }

  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    const movedBy = currentTranslate - prevTranslate;
    
    // Swipe threshold (50px)
    if (movedBy < -50 && currentIndex < slideCount - 1) {
      currentIndex += 1;
    } else if (movedBy > 50 && currentIndex > 0) {
      currentIndex -= 1;
    }
    
    goToSlide(currentIndex);
    prevTranslate = -currentIndex * (wrapper.offsetWidth / slideCount);
  }

  function animation() {
    if (isDragging) requestAnimationFrame(animation);
  }

  // Lightbox View
  slides.forEach((slide) => {
    slide.addEventListener('click', () => {
      const img = slide.querySelector('img');
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
      lightbox.classList.remove('active');
    }
  });
}

// ==========================================================================
// Map and Copy Location Info Logic
// ==========================================================================
function initMapAndLocation() {
  const copyBtn = document.getElementById('btn-copy-address');
  const naverMapBtn = document.getElementById('btn-naver-map');
  
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(EVENT_LOCATION).then(() => {
      showToast('주소가 복사되었습니다.');
    }).catch(err => {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = EVENT_LOCATION;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('주소가 복사되었습니다.');
    });
  });

  // Naver Map search link helper
  naverMapBtn.href = `https://map.naver.com/v5/search/${encodeURIComponent(EVENT_LOCATION)}`;
}

// ==========================================================================
// RSVP Registration Simulation Logic
// ==========================================================================
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const successState = document.getElementById('rsvp-success');
  const countEl = document.getElementById('participant-count');
  const listEl = document.getElementById('recent-participants-list');
  const resetBtn = document.getElementById('btn-rsvp-reset');

  // Load participants from localStorage or use Mock data
  let participants = [];
  try {
    const saved = localStorage.getItem('rsvp_participants');
    if (saved) {
      participants = JSON.parse(saved);
    } else {
      participants = [...MOCK_PARTICIPANTS];
      localStorage.setItem('rsvp_participants', JSON.stringify(participants));
    }
  } catch (e) {
    participants = [...MOCK_PARTICIPANTS];
  }

  function renderParticipants() {
    countEl.textContent = participants.length;
    listEl.innerHTML = '';
    
    // Display last 3 participants
    const recent = participants.slice(-3).reverse();
    recent.forEach(p => {
      const item = document.createElement('div');
      item.className = 'status-recent-item';
      
      const initial = p.name ? p.name.charAt(0) : '참';
      
      item.innerHTML = `
        <div class="status-item-info">
          <div class="status-item-avatar">${initial}</div>
          <div>
            <div class="status-item-name">${escapeHTML(p.name)}</div>
            <div class="status-item-dept">${escapeHTML(p.dept)}</div>
          </div>
        </div>
        <div class="status-item-time">${escapeHTML(p.time || '방금 전')}</div>
      `;
      listEl.appendChild(item);
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Clear participants button handler
  const clearBtn = document.getElementById('btn-clear-participants');
  clearBtn.addEventListener('click', () => {
    // Remove from localStorage
    localStorage.removeItem('rsvp_participants');
    // Reset participants array
    participants = [];
    renderParticipants();
    showToast('모든 신청자 데이터가 초기화되었습니다.');
  });
    e.preventDefault();
    
    const nameVal = document.getElementById('rsvp-name').value.trim();
    const phoneVal = document.getElementById('rsvp-phone').value.trim();
    const deptVal = document.getElementById('rsvp-dept').value.trim();
    
    if (!nameVal || !phoneVal || !deptVal) return;

    // Add new participant
    const newParticipant = {
      name: nameVal,
      dept: deptVal,
      time: '방금 전'
    };

    participants.push(newParticipant);
    
    try {
      localStorage.setItem('rsvp_participants', JSON.stringify(participants));
    } catch (err) {
      console.error(err);
    }
    
    renderParticipants();
    
    // Toggle view with nice animation
    form.classList.add('hidden');
    successState.classList.remove('hidden');
    
    showToast('참가 신청이 성공적으로 등록되었습니다.');
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    successState.classList.add('hidden');
    form.classList.remove('hidden');
  });

  // Initial render
  renderParticipants();
}

// ==========================================================================
// Sharing Feature Logic
// ==========================================================================
function initSharing() {
  const shareBtn = document.getElementById('btn-share');
  
  shareBtn.addEventListener('click', () => {
    const shareData = {
      title: '\'AI 앱 제작소\' 비교과 수업 초대장',
      text: 'AI 앱 제작소 비교과 수업에 여러분을 초대합니다. 실시간 카운트다운과 일정을 확인하세요!',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => showToast('공유가 완료되었습니다.'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy Link
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('초대장 링크가 복사되었습니다.');
      }).catch(err => {
        // Fallback fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('초대장 링크가 복사되었습니다.');
      });
    }
  });
}
