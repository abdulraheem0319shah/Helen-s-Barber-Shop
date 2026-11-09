const business = {
  businessName: "Helen's Barber Shop",
  address: "2006 Firestone Blvd, Los Angeles, CA 90001",
  phones: ["(323) 581-9211", "(213) 306-8933"],
  hours: "Mon - Sat: 10:00 AM - 6:00 PM",
  services: [
    { category: "HAIRCUTS", name: "FADES / TAPERS", price: "$25.00" },
    { category: "HAIRCUTS", name: "REGULAR CUTS", price: "$20.00" },
    { category: "SPECIALS", name: "SENIOR CITIZEN (62+)", price: "$10.00 - $12.00" },
    { category: "HAIRCUTS", name: "WOMENS CUTS", price: "$25.00 & up" },
    { category: "HAIRCUTS", name: "KIDS CUTS (10 & UNDER)", price: "$15.00" },
    { category: "SHAVING", name: "BEARD HOT TOWEL SHAVE", price: "$15.00 - $20.00" },
    { category: "SHAVING", name: "BEARD TRIM", price: "$10.00" },
    { category: "SHAVING", name: "CLEAN-UP / SHAPE UP", price: "$5.00 - $10.00" },
    { category: "GROOMING", name: "EYEBROWS / WAX", price: "$5.00 - $12.00" },
    { category: "GROOMING", name: "BLACK MASK FACIAL", price: "$20.00" },
    { category: "CHEMICAL", name: "PERMS / COLOR", price: "$60.00 & up" },
    { category: "SPECIALS", name: "COMBO: CUT + EYEBROWS + BEARD", price: "$30.00", featured: true }
  ]
};

const gallerySeed = [
  {id:1,image:'/static/Low%20fade%20textured%20top.png',caption:'Low fade / textured top',likes:27,comments:['The blend is flawless.']},
  {id:2,image:'/static/Classic%20gentleman%20cut.png',caption:'Classic gentleman cut',likes:18,comments:[]},
  {id:3,image:'/static/The%20signature%20beard%20line-up.png',caption:'The signature beard line-up',likes:42,comments:['Need this for my next visit.','Clean work.']},
  {id:4,image:'/static/Sharp.%20Simple.%20Yours.png',caption:'Sharp. Simple. Yours.',likes:34,comments:[]},
  {id:5,image:'/static/Precision%20in%20the%20chair.png',caption:'Precision in the chair',likes:21,comments:[]}
];

const reviewSeed = [
  { name: 'JAMES R.', service: 'Fades / Tapers', text: 'Best fade in South LA. Helen and the crew are true professionals, and the atmosphere is exactly what a barbershop should feel like.', rating: 5 },
  { name: 'DAVID M.', service: 'Beard Hot Towel Shave', text: 'The hot towel shave is a full reset. Great attention to detail and never rushed.', rating: 5 },
  { name: 'MIGUEL T.', service: 'Combo: Cut + Eyebrows + Beard', text: 'I have been coming here for years. Consistent, clean, and always leave feeling brand new.', rating: 5 }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]; const readStore = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));  function initNavigation() {   const current = document.body.dataset.page;   $$('.main-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `${current === 'home' ? 'index' : current}.html`));
  const menu = $('.mobile-menu');
  if (menu) menu.addEventListener('click', () => $('.main-nav')?.classList.toggle('open')); }  function initReveal() {   const elements = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(item => observer.observe(item));
}

function initBooking() {
  const modal = $('#bookModal');   if (!modal) {     $$('[data-book]').forEach(button => button.addEventListener('click', () => { window.location.href = 'services.html#book'; }));
    return;
  }

  const serviceSelect = $('#bookingService');
  if (serviceSelect) {
    serviceSelect.innerHTML = business.services.map(item => `<option value="${item.name} — ${item.price}">${item.name} — ${item.price}</option>`).join('');
  }

  $$('[data-book]').forEach(button => button.addEventListener('click', () => modal.classList.add('open')));$('.modal-close', modal)?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });

  const bookingForm = $('#bookingForm', modal);
  if (bookingForm) {
    bookingForm.addEventListener('submit', async event => {
      event.preventDefault();

      const nameInput = bookingForm.querySelector('input[placeholder="Full name"]');
      const dateInput = bookingForm.querySelector('input[type="date"]');
      const timeSelect = bookingForm.querySelector('select');
      const selectedService = bookingForm.querySelector('#bookingService')?.value || '';

      const payload = {
        name: nameInput?.value?.trim() || '',
        service: selectedService,
        date: dateInput?.value || '',
        time: timeSelect?.value || ''
      };

      if (!payload.name || !payload.service || !payload.date || !payload.time) {
        alert('Please complete all booking fields.');
        return;
      }

      try {
        const response = await fetch('/book-appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to book appointment.');

        alert(result.message || 'Appointment booked successfully!');
        bookingForm.reset();
        if (serviceSelect) {
          serviceSelect.innerHTML = business.services.map(item => `<option value="${item.name} — ${item.price}">${item.name} — ${item.price}</option>`).join('');
        }
        modal.classList.remove('open');
      } catch (error) {
        alert(error.message || 'Unable to book appointment right now.');
      }
    });
  }

  if (window.location.hash === '#book') modal.classList.add('open');
}

function renderServices(filter = 'ALL') {
  const grid = $('#servicesGrid');
  if (!grid) return;
  grid.innerHTML = business.services
    .filter(item => filter === 'ALL' || item.category === filter)
    .map(item => `<article class="service-card reveal visible ${item.featured ? 'featured' : ''}"><span class="category">${item.category}</span>${item.featured ? '<span class="best-value">BEST VALUE</span>' : ''}<h3>${item.name}</h3><span class="price">${item.price}</span></article>`)
    .join('');
  $$('.filter').forEach(button => button.addEventListener('click', () => {$$
('.filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    renderServices(button.dataset.filter);
  }));
}

function renderGallery() {
  const grid = $('#galleryGrid');
  if (!grid) return;
  let items = readStore('helenGallery', gallerySeed);
  const previousSeedImages = new Set([
    '/static/photo-1622286342621-4bd786c2447c.avif',
    '/static/images (1).jpg',
    '/static/images.jpg'
  ]);
  const updatedItems = items.map(item => {
    const seed = gallerySeed.find(entry => entry.id === item.id);
    return seed && previousSeedImages.has(item.image) ? { ...item, image: seed.image, caption: seed.caption } : item;
  });
  if (updatedItems.some((item, index) => item.image !== items[index].image || item.caption !== items[index].caption)) {
    items = updatedItems;
    writeStore('helenGallery', items);
  }
  grid.innerHTML = items.map(item => `<article class="gallery-card reveal visible"><button class="gallery-image-button" data-gallery-id="${item.id}"><img src="${item.image}" alt="${item.caption}" loading="lazy"></button><div class="gallery-meta"><p>${item.caption}</p><div><button class="like-btn ${item.liked ? 'liked' : ''}" data-like="${item.id}" aria-label="Like ${item.caption}">♥ <span>${item.likes}</span></button><button class="comment-toggle" data-gallery-id="${item.id}">COMMENTS</button></div></div></article>`).join('');
  
  $$('[data-gallery-id]').forEach(button => button.addEventListener('click', event => {     if (event.target.closest('.like-btn') || event.target.closest('.comment-toggle')) return;     openLightbox(Number(button.dataset.galleryId));   }));    $$
('[data-like]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const data = readStore('helenGallery', gallerySeed);
    const item = data.find(entry => entry.id === Number(button.dataset.like));
    if (item && !item.liked) {
      item.likes++;
      item.liked = true;
      writeStore('helenGallery', data);
      renderGallery();
    }
  }));
}

let lightboxItemId = null;
function openLightbox(id) {
  const modal = $('#lightbox');
  if (!modal) return;
  const item = readStore('helenGallery', gallerySeed).find(entry => entry.id === id);
  if (!item) return;
  lightboxItemId = id;
  const img = $('#lightboxImage');
  if (img) { img.src = item.image; img.alt = item.caption; }
  const likeBtn = $('#lightboxLike');
  if (likeBtn) { likeBtn.className = `like-btn ${item.liked ? 'liked' : ''}`; likeBtn.innerHTML = `♥ <span>${item.likes}</span>`; }
  const comments = $('#lightboxComments');
  if (comments) { comments.innerHTML = item.comments.map(comment => `<p class="comment-bubble">${comment}</p>`).join(''); }
  modal.classList.add('open');
}

function initLightbox() {
  const modal = $('#lightbox');
  if (!modal) return;
  $('.lightbox-close', modal)?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') modal.classList.remove('open'); });
  
  $('#lightboxLike')?.addEventListener('click', () => {
    const data = readStore('helenGallery', gallerySeed);
    const item = data.find(entry => entry.id === lightboxItemId);
    if (item && !item.liked) {
      item.likes++;
      item.liked = true;
      writeStore('helenGallery', data);
      openLightbox(lightboxItemId);
      renderGallery();
    }
  });

  $('#lightboxCommentForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('input', event.target);
    if (!input || !input.value.trim()) return;
    const data = readStore('helenGallery', gallerySeed);
    const item = data.find(entry => entry.id === lightboxItemId);
    if (item) {
      item.comments.push(input.value.trim());
      writeStore('helenGallery', data);
      input.value = '';
      openLightbox(lightboxItemId);
      renderGallery();
    }
  });
}

function initReviews() {
  const grid = $('#reviewsGrid');
  if (grid) {
    const reviews = readStore('helenReviews', reviewSeed);
    grid.innerHTML = reviews.map(review => `<article class="review-card reveal visible"><div class="stars">${'★'.repeat(review.rating)}</div><p>“${review.text}”</p><strong>${review.name}</strong><small>${review.service}</small></article>`).join('');
  }
  const form = $('#reviewForm');   if (!form) return;   let rating = 5;   const stars = $$('#starPicker button');
  const paint = value => stars.forEach(star => star.classList.toggle('selected', Number(star.dataset.star) <= value));
  paint(rating);
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => paint(Number(star.dataset.star)));
    star.addEventListener('click', () => { rating = Number(star.dataset.star); paint(rating); });
  });
  $('#starPicker')?.addEventListener('mouseleave', () => paint(rating));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const reviews = readStore('helenReviews', reviewSeed);
    const nameVal = $('#reviewName')?.value || '';
    const serviceVal = $('#reviewService')?.value || '';
    const commentVal = $('#reviewComment')?.value || '';
    reviews.unshift({ name: nameVal.toUpperCase(), service: serviceVal, text: commentVal, rating });
    writeStore('helenReviews', reviews);
    form.reset();
    rating = 5;
    paint(rating);
    initReviews();
  });
}

function initUpload() {
  const button = $('#uploadBtn'), modal = $('#uploadModal'), form = $('#uploadForm');
  if (!button || !modal || !form) return;
  button.addEventListener('click', () => modal.classList.add('open'));
  $('.modal-close', modal)?.addEventListener('click', () => modal.classList.remove('open'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if ($('#uploadPin')?.value !== '2008') { alert('Access denied.'); return; }
    const data = readStore('helenGallery', gallerySeed);
    data.unshift({
      id: Date.now(),
      image: $('#uploadImage')?.value || '',
      caption: $('#uploadCaption')?.value || '',
      likes: 0,
      comments: []
    });
    writeStore('helenGallery', data);
    form.reset();
    modal.classList.remove('open');
    renderGallery();
  });
}

function initAuth() {
  const form = $('#authForm');
  if (!form) return;
  let tab = 'signin';
  const setTab = value => {
    $$('.auth-tabs button').forEach(button => button.classList.toggle('active', button.dataset.authTab === value));$$
('.signup-only').forEach(field => field.style.display = value === 'signup' ? 'block' : 'none');
    const authTitle = $('#authTitle');     if (authTitle) authTitle.innerHTML = value === 'signup' ? 'JOIN THE <em>CLUB.</em>' : 'WELCOME <em>BACK.</em>';     tab = value;   };   $$('[data-auth-tab]').forEach(button => button.addEventListener('click', () => setTab(button.dataset.authTab)));
  setTab(tab);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = $('#authName')?.value?.trim() || '';
    const email = $('#authEmail')?.value?.trim() || '';
    const password = $('#authPassword')?.value || '';
    const status = $('#authStatus');
    if (!email || !password) {
      if (status) status.textContent = 'Please enter your email and password.';
      return;
    }
    const endpoint = tab === 'signup' ? '/signup' : '/login';
    const payload = tab === 'signup' ? { full_name: name, email, password } : { email, password };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Authentication failed.');
      if (status) status.textContent = result.message || 'Success.';
      if (tab === 'signup' || tab === 'signin') {
        localStorage.setItem('helenUser', result.user?.full_name || email.split('@')[0]);
        setTimeout(() => window.location.href = 'index.html', 800);
      }
    } catch (error) {
      if (status) status.textContent = error.message || 'Unable to complete authentication.';
    }
  });
}

function initFooter() {
  const footer = $('footer');
  if (!footer) return;
  footer.className = 'site-footer bg-[#09090B] border-t border-red-900/30 text-slate-400 py-12 px-8';
  footer.innerHTML = `
    <div class="footer-main max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
      <div class="footer-column footer-brand">
        <a class="brand" href="index.html"><span>HELEN'S</span> <strong>BARBER SHOP</strong></a>
        <p class="mt-2 text-sm">Elite grooming, classic craft, and premium barbering in Los Angeles.</p>
      </div>
      <div class="footer-column">
        <h4 class="text-white font-bold text-lg mb-4">Explore</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="index.html" class="hover:text-red-500">Home</a></li>
          <li><a href="about.html" class="hover:text-red-500">About Us</a></li>
          <li><a href="services.html" class="hover:text-red-500">Services</a></li>
          <li><a href="gallery.html" class="hover:text-red-500">Gallery</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="text-white font-bold text-lg mb-4">Resources</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="feedback.html" class="hover:text-red-500">Customer Reviews</a></li>
          <li><a href="services.html#book" class="hover:text-red-500">Book Chair</a></li>
          <li><a href="contact.html" class="hover:text-red-500">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-column footer-contact">
        <h4 class="text-white font-bold text-lg mb-4">Visit Us</h4>
        <address class="not-italic text-sm space-y-1">
          <p>2006 Firestone Blvd</p>
          <p>Los Angeles, CA 90001</p>
          <p>(323) 581-9211</p>
          <p>Mon - Sat: 10:00 AM - 6:00 PM</p>
        </address>
      </div>
      <div class="footer-column footer-socials-col">
        <h4 class="text-white font-bold text-lg mb-4">Follow Us</h4>
        <div class="footer-social-icons-wrapper flex space-x-4 text-sm"></div>
      </div>
    </div>
    <div class="footer-bottom max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
      <span>© 2026 Helen's Barber Shop. All rights reserved.</span>
      <span class="footer-legal"><a href="#" class="hover:text-red-500">PRIVACY</a> / <a href="#" class="hover:text-red-500">TERMS</a></span>
    </div>`;
}

function initFooterSocialIcons() {
  const container = $('.footer-social-icons-wrapper');
  if (!container) return;
  container.innerHTML = `
    <a href="#" aria-label="Instagram" class="hover:text-red-500"><svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
    <a href="#" aria-label="Facebook" class="hover:text-red-500"><svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg></a>
  `;
}

function initFooterJump() {
  if ($('#footerJump')) return;
  document.body.insertAdjacentHTML('beforeend', '<button id="footerJump" class="footer-jump" type="button" aria-label="Scroll to bottom" title="Go to footer">↓</button>');
  $('#footerJump')?.addEventListener('click', () => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }  function initBrandLogo() {   const logoPath = '/static/logo.png';   $$('.brand').forEach(brand => {
    brand.innerHTML = `<img class="brand-logo" src="${logoPath}" alt="Helen's Barber Shop logo"><span class="brand-wordmark">HELEN'S <b>BARBER SHOP</b></span>`;
  });
  if (!$('link[rel="icon"]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = logoPath;
    document.head.appendChild(favicon);
  }
}

function initAssistant() {
  if ($('#assistantWidget')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="assistantWidget" class="assistant-widget">
      <button id="assistantToggle" class="assistant-toggle" aria-label="Open AI Assistant">▣</button>
      <section id="assistantPanel" class="assistant-panel" aria-label="AI Barber Assistant">
        <div class="assistant-head">
          <span><b>HELEN'S AI BARBER ASSISTANT</b><small>ONLINE</small></span>
          <button id="assistantClose" aria-label="Close assistant">×</button>
        </div>
        <div id="assistantMessages" class="assistant-messages">
          <div class="assistant-message bot">Welcome in. Ask about appointments, prices, or our location.</div>
        </div>
        <div class="assistant-replies">
          <button data-assistant-question="I want to book an appointment">Book Appointment</button>
          <button data-assistant-question="What are your prices?">Check Prices</button>
          <button data-assistant-question="Where are you located and what are your hours?">Location & Hours</button>
        </div>
        <form id="assistantForm">
          <input id="assistantInput" required placeholder="Ask the assistant...">
          <button aria-label="Send message">↑</button>
        </form>
      </section>
    </div>
  `);

  const panel = $('#assistantPanel');
  const addMessage = (text, type) => {
    const container = $('#assistantMessages');
    if (!container) return;
    container.insertAdjacentHTML('beforeend', `<div class="assistant-message ${type}">${text}</div>`);
    container.scrollTop = container.scrollHeight;
  };

  const processQuery = async (text) => {
    if (!text.trim()) return;
    addMessage(text, 'user');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      const reply = data.response || data.reply || 'Sorry, I could not process that request.';
      addMessage(reply, 'bot');
    } catch (error) {
      addMessage('Server connection error. Please try again.', 'bot');
    }
  };

  $('#assistantToggle')?.addEventListener('click', () => panel?.classList.toggle('open'));
  $('#assistantClose')?.addEventListener('click', () => panel?.classList.remove('open'));    $$('[data-assistant-question]').forEach(button => {
    button.addEventListener('click', () => processQuery(button.dataset.assistantQuestion));
  });

  $('#assistantForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#assistantInput');
    if (input) {
      processQuery(input.value);
      input.value = '';
    }
  });
}

function initGeminiIcon() {
  const toggle = $('#assistantToggle');
  if (!toggle) return;
  toggle.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3c2.8 12.1 8.9 18.2 21 21-12.1 2.8-18.2 8.9-21 21-2.8-12.1-8.9-18.2-21-21 12.1-2.8 18.2-8.9 21-21Z" fill="url(#sparkleGradient)"/><path d="M39 5c.8 3.7 2.3 5.2 6 6-3.7.8-5.2 2.3-6 6-.8-3.7-2.3-5.2-6-6 3.7-.8 5.2-2.3 6-6Z" fill="#fff"/><defs><linearGradient id="sparkleGradient" x1="4" y1="4" x2="44" y2="44"><stop stop-color="#fff"/><stop offset=".48" stop-color="#fbbf24"/><stop offset="1" stop-color="#fff"/></linearGradient></defs></svg>';
}

function init() {
  initNavigation();
  initReveal();
  initBooking();
  renderServices();
  renderGallery();
  initLightbox();
  initReviews();
  initUpload();
  initAuth();
  initFooter();
  initFooterSocialIcons();
  initAssistant();
  initGeminiIcon();
  initFooterJump();
  initBrandLogo();
}

document.addEventListener('DOMContentLoaded', init);