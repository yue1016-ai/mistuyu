/* ==========================================================================
   Mistuyu (敏書悠) Website - Interactive Scripts
   Features:
   - Cosmic Canvas Starfield & Twinkle Effect
   - 3D Card Tilt Interaction
   - Web Audio API Chime Synth
   - Like / Cheer Counter with Floating Particle Hearts
   - Notion Link Copy Toast
   - Image Lightbox Preview
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initTiltEffect();
  initSoundFx();
  initCheerButton();
  initCopyLink();
  initGalleryModal();
});

/* ---------------------------------------------------------
   1. Dynamic Starfield Canvas
--------------------------------------------------------- */
function initStarfield() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const starCount = Math.floor((width * height) / 4500);
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#d8b4fe' : '#fbcfe8')
    });
  }

  // Shooting star
  let shootingStar = null;
  function maybeSpawnShootingStar() {
    if (!shootingStar && Math.random() < 0.008) {
      shootingStar = {
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        length: Math.random() * 80 + 50,
        speed: Math.random() * 10 + 12,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 1
      };
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw static twinkling stars
    stars.forEach(star => {
      star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
      const clampedAlpha = Math.max(0.15, Math.min(1, star.alpha));

      ctx.save();
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = clampedAlpha;
      ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
      ctx.shadowColor = star.color;
      ctx.fill();
      ctx.restore();

      // Gentle drift upward
      star.y -= star.speed;
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }
    });

    // Draw shooting star
    maybeSpawnShootingStar();
    if (shootingStar) {
      const { x, y, length, speed, angle, opacity } = shootingStar;
      const endX = x - Math.cos(angle) * length;
      const endY = y - Math.sin(angle) * length;

      const grad = ctx.createLinearGradient(x, y, endX, endY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      grad.addColorStop(0.4, `rgba(192, 132, 252, ${opacity * 0.8})`);
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      shootingStar.x += Math.cos(angle) * speed;
      shootingStar.y += Math.sin(angle) * speed;
      shootingStar.opacity -= 0.018;

      if (shootingStar.opacity <= 0 || shootingStar.x > width + 100 || shootingStar.y > height + 100) {
        shootingStar = null;
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ---------------------------------------------------------
   2. 3D Card Tilt Effect on Avatar Card
--------------------------------------------------------- */
function initTiltEffect() {
  const card = document.getElementById('tilt-card');
  if (!card) return;

  const container = card.parentElement;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
  });

  container.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
}

/* ---------------------------------------------------------
   3. Web Audio API Chime Synth (Delightful Soft Harp/Bell)
--------------------------------------------------------- */
let audioCtx = null;
let soundEnabled = true;

function initSoundFx() {
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? '🔔' : '🔕';
    soundBtn.title = soundEnabled ? '靜音音效' : '開啟音效';
    if (soundEnabled) {
      playDreamyChime(523.25); // C5
    }
  });
}

function playDreamyChime(freq = 587.33) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.65);
  } catch (err) {
    // Audio might fail without user interaction gesture
  }
}

/* ---------------------------------------------------------
   4. Cheer / Like Button with Physics Floating Hearts
--------------------------------------------------------- */
function initCheerButton() {
  const cheerBtn = document.getElementById('btn-cheer');
  const countSpan = document.getElementById('cheer-count');
  if (!cheerBtn || !countSpan) return;

  const STORAGE_KEY = 'mistuyu_cheer_count';
  let count = parseInt(localStorage.getItem(STORAGE_KEY) || '520', 10);
  countSpan.textContent = count;

  cheerBtn.addEventListener('click', (e) => {
    count++;
    countSpan.textContent = count;
    localStorage.setItem(STORAGE_KEY, count);

    // Play pleasant high chime
    const notes = [523.25, 587.33, 659.25, 783.99, 880];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    playDreamyChime(randomNote);

    // Spawn floating particles
    spawnHearts(e.clientX, e.clientY);
  });
}

function spawnHearts(originX, originY) {
  const symbols = ['💜', '💖', '✨', '🌸', '⭐', '🤍'];
  const count = 5;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const tx = (Math.random() - 0.5) * 120;
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.left = `${originX - 12}px`;
    heart.style.top = `${originY - 20}px`;

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1400);
  }
}

/* ---------------------------------------------------------
   5. Copy Link to Clipboard with Toast
--------------------------------------------------------- */
function initCopyLink() {
  const copyBtn = document.getElementById('btn-copy-notion');
  const toast = document.getElementById('toast');
  if (!copyBtn || !toast) return;

  copyBtn.addEventListener('click', () => {
    const notionUrl = 'https://app.notion.com/p/Mistuyu-24ac3e1673b780169c05c33cce4c2468';
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(notionUrl).then(showToast).catch(() => {
        fallbackCopy(notionUrl);
      });
    } else {
      fallbackCopy(notionUrl);
    }
  });

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast();
    } catch (e) {
      console.error(e);
    }
    input.remove();
  }

  function showToast() {
    playDreamyChime(659.25); // E5 note
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

/* ---------------------------------------------------------
   6. Image Lightbox Modal for Gallery
--------------------------------------------------------- */
function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const closeBtn = document.getElementById('modal-close');
  const triggers = document.querySelectorAll('[data-gallery-trigger]');

  if (!modal || !modalImg) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-full-src');
      const caption = trigger.getAttribute('data-caption');
      modalImg.src = src;
      if (modalCaption) modalCaption.textContent = caption || '';
      modal.classList.add('active');
      playDreamyChime(440);
    });
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
