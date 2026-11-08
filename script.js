// Apply CONFIG values to the DOM
function applyConfig() {
  const c = CONFIG;
  const wa = c.whatsapp.replace(/[^0-9]/g, '');

  // Name everywhere
  document.querySelectorAll('[data-name]').forEach(el => el.textContent = c.name);
  document.querySelectorAll('[data-firstname]').forEach(el => el.textContent = c.firstName);

  // Title & taglines
  document.querySelector('[data-title]').textContent = c.title;
  if (document.querySelector('[data-tagline]')) document.querySelector('[data-tagline]').innerHTML = c.tagline.replace(c.firstName, `<span>${c.firstName}</span>`);
  document.querySelector('[data-subtagline]').textContent = c.subTagline;

  // Page title
  document.title = `Glam by ${c.firstName} | ${c.title}`;

  // Social links
  const waMsg = encodeURIComponent(c.whatsappMsg);
  document.querySelectorAll('[data-wa]').forEach(el => el.href = `https://wa.me/${wa}?text=${waMsg}`);
  document.querySelectorAll('[data-ig]').forEach(el => {
    el.href = `https://instagram.com/${c.instagram}`;
    const p = el.querySelector('p'); if (p) p.textContent = `@${c.instagram}`;
  });
  document.querySelectorAll('[data-yt]').forEach(el => el.href = `https://youtube.com/@${c.youtube}`);
  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = `mailto:${c.email}`;
    const p = el.querySelector('p'); if (p) p.textContent = c.email;
  });

  // About text
  const aboutContainer = document.querySelector('[data-about]');
  if (aboutContainer) aboutContainer.innerHTML = c.about.map(t => `<p>${t}</p>`).join('');

  // Stats
  document.querySelectorAll('[data-stat]').forEach((el, i) => {
    if (c.stats[i]) {
      el.querySelector('h3').textContent = c.stats[i].value;
      el.querySelector('p').textContent  = c.stats[i].label;
    }
  });

  // Footer year & copyright
  document.querySelector('[data-year]').textContent = c.year;
  document.querySelector('[data-copyright]').textContent = `© ${c.year} Glam by ${c.firstName}. All rights reserved.`;
}

document.addEventListener('DOMContentLoaded', applyConfig);

function buildGallery() {
  const c = CONFIG;
  const categoryLabels = {
    wedding: 'Wedding Makeup',
    party:   'Party Makeup',
    saree:   'Saree Draping',
    hair:    'Hair Style',
    nail:    'Nail Art',
    beauty:  'Beauty Services'
  };

  // Hero & About photos
  const heroImg = document.getElementById('hero-photo');
  if (heroImg) heroImg.src = c.heroPhoto;
  const aboutImg = document.getElementById('about-photo');
  if (aboutImg) aboutImg.src = c.aboutPhoto;

  // Build gallery
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = '';
  c.gallery.forEach(item => {
    const div = document.createElement('div');
    div.className = `gallery-item ${item.category}${item.tall ? ' tall' : ''}`;
    div.onclick = function() { openLightbox(this); };
    div.innerHTML = `
      <img src="${item.image}" alt="${categoryLabels[item.category]}" loading="lazy"/>
      <div class="gallery-overlay">
        <span class="tag">${categoryLabels[item.category]}</span>
        <p>${item.label}</p>
        <i class="fas fa-expand"></i>
      </div>`;
    gallery.appendChild(div);
  });

  // Apply initial "All" filter (2 per category)
  const seen = {};
  document.querySelectorAll('.gallery-item').forEach(item => {
    const cats = ['wedding','party','saree','hair','nail','beauty'];
    const cat = cats.find(c => item.classList.contains(c));
    if (!cat) return;
    seen[cat] = (seen[cat] || 0) + 1;
    if (seen[cat] > 2) item.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', buildGallery);

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

// Gallery filter
function filterGallery(category, btn) {
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (category === 'all') {
    // Show only first 2 per category in "All" view
    const seen = {};
    document.querySelectorAll('.gallery-item').forEach(item => {
      const cats = ['wedding','party','saree','hair','nail','beauty'];
      const cat = cats.find(c => item.classList.contains(c));
      if (!cat) return;
      seen[cat] = (seen[cat] || 0) + 1;
      if (seen[cat] <= 2) item.classList.remove('hidden');
      else item.classList.add('hidden');
    });
  } else {
    document.querySelectorAll('.gallery-item').forEach(item => {
      if (item.classList.contains(category)) item.classList.remove('hidden');
      else item.classList.add('hidden');
    });
  }
}

// Lightbox
let currentItems = [], currentIndex = 0;

function openLightbox(el) {
  const img   = el.querySelector('img');
  const tag   = el.querySelector('.tag').textContent;
  const title = el.querySelector('p').textContent;

  currentItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  currentIndex = currentItems.indexOf(el);

  document.getElementById('lightbox-img').src   = img.src;
  document.getElementById('lightbox-img').alt   = img.alt;
  document.getElementById('lightbox-tag').textContent   = tag;
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lightbox-close')) return;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir, e) {
  e.stopPropagation();
  currentIndex = (currentIndex + dir + currentItems.length) % currentItems.length;
  const el    = currentItems[currentIndex];
  const img   = el.querySelector('img');
  const lbImg = document.getElementById('lightbox-img');
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    document.getElementById('lightbox-tag').textContent   = el.querySelector('.tag').textContent;
    document.getElementById('lightbox-title').textContent = el.querySelector('p').textContent;
    lbImg.style.opacity = '1';
  }, 180);
}

document.getElementById('lightbox-img').style.transition = 'opacity 0.18s ease';

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') { lb.classList.remove('open'); document.body.style.overflow = ''; }
  if (e.key === 'ArrowRight') lightboxNav(1, { stopPropagation: () => {} });
  if (e.key === 'ArrowLeft')  lightboxNav(-1, { stopPropagation: () => {} });
});

function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = '✓ Request Sent!';
  btn.style.background = '#25d366';
  setTimeout(() => {
    btn.textContent = 'Send Booking Request';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Nav scroll style
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// Cursor glow
const glow = document.getElementById('cursorGlow');
if (glow) {
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// Particles
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) {
    dots.push({
      x: Math.random() * 1920, y: Math.random() * 900,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${d.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
