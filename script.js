/* ===== 5G TAXI — script.js ===== */

/* ------ 1. Mobile Navigation ------ */
const menu = document.getElementById('menu');
const nav  = document.getElementById('nav');

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

// Close nav when a link is clicked
document.querySelectorAll('#nav a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  })
);

/* ------ 2. Booking Form — Save to Google Sheet + WhatsApp ------ */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxSeVdBIjL8XNQgRAoV9MRZeiFUL7dcIDn9A9AMSA4M2WmCp3xo5Un9lYzKCn_QrRiK/exec';
const form = document.getElementById('form');

form?.addEventListener('submit', e => {
  e.preventDefault();

  const d = new FormData(form);

  // Collect all booking data
  const bookingData = {
    name:       d.get('name'),
    mobile:     d.get('mobile'),
    pickup:     d.get('pickup'),
    drop:       d.get('drop'),
    date:       d.get('date'),
    time:       d.get('time'),
    passengers: d.get('passengers') || 'Not specified',
    vehicle:    d.get('vehicle')    || 'Any Available',
    trip:       d.get('trip'),
    message:    d.get('message')    || ''
  };

  // Build WhatsApp message
  const msg =
    `Hello 5G Taxi,\n\nI would like to book a taxi.\n\n` +
    `Name: ${bookingData.name}\n` +
    `Mobile: ${bookingData.mobile}\n` +
    `Pickup: ${bookingData.pickup}\n` +
    `Drop: ${bookingData.drop}\n` +
    `Date: ${bookingData.date}\n` +
    `Time: ${bookingData.time}\n` +
    `Passengers: ${bookingData.passengers}\n` +
    `Vehicle: ${bookingData.vehicle}\n` +
    `Trip Type: ${bookingData.trip}\n` +
    `Message: ${bookingData.message || 'None'}`;

  // Show loading state on button
  const submitBtn = form.querySelector('button[type="submit"], button.full');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.textContent = 'Saving Booking...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
  }

  // Pre-prepare WhatsApp URL
  const waUrl = 'https://wa.me/918148157275?text=' + encodeURIComponent(msg);

  // Send to Google Sheet safely using a GET request (Bypasses all CORS issues completely)
  const queryParams = new URLSearchParams(bookingData).toString();
  const safeSubmitUrl = SHEET_URL + '?' + queryParams;

  try {
    fetch(safeSubmitUrl, { method: 'GET', mode: 'no-cors' })
      .catch(err => console.warn('Sheet fetch err:', err));
  } catch (err) {
    console.warn('Sheet save warning:', err);
  }

  // Brief pause so the user sees the confirmation before redirect/opening
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.textContent = '✓ Booking Sent!';
      submitBtn.style.background = '#168b4b';
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = '';
        form.reset();
      }, 2500);
    }
    // Open WhatsApp
    const win = window.open(waUrl, '_blank');
    if (!win) {
      // In case popup was blocked by browser
      window.location.href = waUrl;
    }
  }, 400);
});

/* Set date minimum to today */
const dateInput = document.querySelector('input[name="date"]');
if (dateInput) {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split('T')[0];
}

/* ------ 3. Fleet Tab Filter & Book Buttons ------ */
const tabs  = document.querySelectorAll('.fleet-tab');
const cards = document.querySelectorAll('.fleet-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;

    cards.forEach(card => {
      if (filter === 'all' || card.dataset.type === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Book This Car buttons
document.querySelectorAll('.fleet-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const carName = btn.getAttribute('data-car');
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (vehicleSelect && carName) {
      vehicleSelect.value = carName;
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ------ 4. FAQ Accordion ------ */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer   = btn.nextElementSibling;
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });

    // Toggle clicked item
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

/* ------ 5. Scroll Reveal Animation (IntersectionObserver) ------ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ------ 6. Scroll-to-Top Button ------ */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ------ 7. Interactive Photo Gallery & Manual Upload Engine ------ */
const galleryGrid = document.getElementById('galleryGrid');
const galleryUploadInput = document.getElementById('galleryUploadInput');
const photoCaptionInput = document.getElementById('photoCaptionInput');
const btnSaveUploadedPhoto = document.getElementById('btnSaveUploadedPhoto');

// Key for persistent local storage
const GALLERY_STORAGE_KEY = '5g_taxi_uploaded_gallery_v1';

// Load previously saved uploaded photos from localStorage
function loadCustomGalleryPhotos() {
  if (!galleryGrid) return;
  try {
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!saved) return;
    const photos = JSON.parse(saved);

    photos.forEach((item, index) => {
      renderGalleryItem(item.imgSrc, item.caption, index);
    });
  } catch (err) {
    console.warn('Error loading custom gallery photos:', err);
  }
}

// Render photo item into grid
function renderGalleryItem(imgSrc, caption, index) {
  const div = document.createElement('div');
  div.className = 'gallery-item custom-upload';
  div.innerHTML = `
    <img src="${imgSrc}" alt="${caption || 'Custom Tour Photo'}" loading="lazy">
    <div class="gallery-overlay">
      <span>${caption || '5G Taxi Pilgrimage & Tour Moment'}</span>
    </div>
    <span class="custom-photo-badge">NEW</span>
    <button type="button" class="btn-delete-photo" title="Delete photo" data-index="${index}">✕</button>
  `;

  // Prepend so latest uploads appear first
  if (galleryGrid.firstChild) {
    galleryGrid.insertBefore(div, galleryGrid.firstChild);
  } else {
    galleryGrid.appendChild(div);
  }

  // Delete listener
  const delBtn = div.querySelector('.btn-delete-photo');
  delBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm("Remove this photo from your gallery?")) {
      deleteCustomPhoto(index);
    }
  });
}

// Save a new photo to localStorage and render
function saveCustomPhoto(imgSrc, caption) {
  try {
    let photos = [];
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (saved) photos = JSON.parse(saved);

    photos.push({ imgSrc, caption });
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));

    // Re-render
    refreshGalleryGrid();
  } catch (err) {
    alert("Storage limit reached! Please use smaller images.");
  }
}

// Delete custom photo
function deleteCustomPhoto(idxToRemove) {
  try {
    let photos = [];
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (saved) photos = JSON.parse(saved);

    photos.splice(idxToRemove, 1);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));
    refreshGalleryGrid();
  } catch (err) {}
}

// Re-render gallery keeping default items intact
function refreshGalleryGrid() {
  document.querySelectorAll('.gallery-item.custom-upload').forEach(el => el.remove());
  loadCustomGalleryPhotos();
}

let selectedFileDataUrl = null;

// Handle image selection
galleryUploadInput?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 4 * 1024 * 1024) {
    alert("Please select a photo under 4MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    selectedFileDataUrl = event.target.result;
    const uploadLabel = document.querySelector('label[for="galleryUploadInput"]');
    if (uploadLabel) {
      uploadLabel.textContent = `✓ Selected: ${file.name.substring(0, 15)}...`;
      uploadLabel.style.background = '#dcfce7';
      uploadLabel.style.borderColor = '#16a34a';
      uploadLabel.style.color = '#15803d';
    }
  };
  reader.readAsDataURL(file);
});

// Handle "Add to Gallery" click
btnSaveUploadedPhoto?.addEventListener('click', function() {
  if (!selectedFileDataUrl) {
    alert("Please click 'Upload New Photo' and choose an image first!");
    return;
  }

  const caption = (photoCaptionInput?.value || '').trim() || '5G Taxi Customer Trip';

  saveCustomPhoto(selectedFileDataUrl, caption);

  // Reset controls
  selectedFileDataUrl = null;
  if (galleryUploadInput) galleryUploadInput.value = '';
  if (photoCaptionInput) photoCaptionInput.value = '';

  const uploadLabel = document.querySelector('label[for="galleryUploadInput"]');
  if (uploadLabel) {
    uploadLabel.textContent = '📷 Upload New Photo';
    uploadLabel.style.background = '';
    uploadLabel.style.borderColor = '';
    uploadLabel.style.color = '';
  }

  alert("🎉 Photo successfully added to your Gallery!");
});

// Initial load on startup
document.addEventListener('DOMContentLoaded', loadCustomGalleryPhotos);
