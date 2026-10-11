/**
 * PORTOFOLIO WELDO RAVENDRA HENDRI, S.Kom
 * Interactive JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. NAVBAR SCROLL EFFECT & ACTIVE NAVIGATION SPY
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  let isScrolling = false;

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Scroll spy
        let currentSection = '';
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
          currentSection = 'kontak';
        } else {
          sections.forEach((section) => {
            const sectionTop = section.offsetTop - 110;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
              currentSection = section.getAttribute('id') || '';
            }
          });
        }

        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
          }
        });
        
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // 2. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // 3. STATS / RATING NUMBER COUNTER ANIMATION
  const statNumbers = document.querySelectorAll('.stat-number');
  let counted = false;

  const countUp = (el, target, decimals = 0, suffix = '') => {
    let start = 0;
    const duration = 1400;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
        el.textContent = (decimals > 0 ? target.toFixed(decimals) : Math.floor(target)) + suffix;
        return;
      }
      el.textContent = (decimals > 0 ? start.toFixed(decimals) : Math.floor(start)) + suffix;
    }, stepTime);
  };

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNumbers.forEach((el) => {
          const raw = el.getAttribute('data-count');
          if (raw) {
            const hasDecimals = raw.includes('.');
            const decimals = hasDecimals ? (raw.split('.')[1] || '').length : 0;
            const targetVal = parseFloat(raw);
            const suffix = raw.includes('+') ? '+' : (el.getAttribute('data-suffix') || '');
            countUp(el, targetVal, decimals, suffix);
          }
        });

        // Ensure stat-card gets active class to trigger smooth star-fill transition
        document.querySelectorAll('.stat-card').forEach((card) => {
          card.classList.add('active');
        });
      }
    }, { threshold: 0.2 });
    statsObserver.observe(statsSection);
  }

  // 4. GALLERY FILTERING
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 5. LIGHTBOX MODAL FUNCTIONALITY
  const lightbox = document.getElementById('photoLightbox');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxSwiperWrapper = document.getElementById('lightboxSwiperWrapper');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxPagination = document.getElementById('lightboxPagination');
  const lightboxCounter = document.getElementById('lightboxCounter');

  let currentGalleryIndex = 0;
  let lightboxSwiperInstance = null;
  const interactiveItems = Array.from(document.querySelectorAll('[data-lightbox="true"]'));

  function openLightbox(index) {
    if (index < 0 || index >= interactiveItems.length) return;
    currentGalleryIndex = index;
    const item = interactiveItems[currentGalleryIndex];

    // Bersihkan instance lama jika ada
    if (lightboxSwiperInstance) {
      lightboxSwiperInstance.destroy(true, true);
      lightboxSwiperInstance = null;
    }

    // Periksa apakah item memiliki multi-slide (seperti Remaja Masjid Swiper)
    const swiperEl = item.querySelector('.gallery-swiper');
    const originalSlides = swiperEl
      ? Array.from(swiperEl.querySelectorAll('.swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)'))
      : [];

    const isMultiSlide = originalSlides.length > 1;

    // Hentikan sementara autoplay slider luar saat lightbox terbuka
    if (window.mainGallerySwiper && window.mainGallerySwiper.autoplay) {
      window.mainGallerySwiper.autoplay.stop();
    }

    if (isMultiSlide) {
      // Dapatkan index slide yang sedang aktif di luar
      let activeSlideIdx = 0;
      if (window.mainGallerySwiper && typeof window.mainGallerySwiper.realIndex !== 'undefined') {
        activeSlideIdx = window.mainGallerySwiper.realIndex;
      } else {
        const activeSlide = item.querySelector('.swiper-slide-active');
        if (activeSlide) {
          const idx = originalSlides.findIndex(s => s.querySelector('img')?.src === activeSlide.querySelector('img')?.src);
          if (idx !== -1) activeSlideIdx = idx;
        }
      }

      // Kumpulkan data semua slide
      const slidesData = originalSlides.map((slide, i) => ({
        src: slide.querySelector('img')?.src || '',
        alt: slide.querySelector('img')?.alt || `Foto Kegiatan ${i + 1}`,
        title: slide.getAttribute('data-slide-title') || item.getAttribute('data-title') || 'Dokumentasi Kegiatan',
        desc: slide.getAttribute('data-slide-desc') || item.getAttribute('data-desc') || '',
        cat: item.getAttribute('data-cat-label') || 'Kegiatan'
      }));

      // Render slide ke dalam lightbox swiper wrapper
      if (lightboxSwiperWrapper) {
        lightboxSwiperWrapper.innerHTML = slidesData.map(s => `
          <div class="swiper-slide">
            <div class="lightbox-slide-img-wrap">
              <img src="${s.src}" alt="${s.alt}" />
            </div>
          </div>
        `).join('');
      }

      // Tampilkan kontrol navigasi dan pagination
      if (lightboxPagination) lightboxPagination.style.display = 'flex';
      if (lightboxPrev) lightboxPrev.style.display = 'flex';
      if (lightboxNext) lightboxNext.style.display = 'flex';
      if (lightboxCounter) lightboxCounter.style.display = 'inline-flex';

      // Set teks awal
      const initData = slidesData[activeSlideIdx] || slidesData[0];
      if (lightboxTitle) lightboxTitle.textContent = initData.title;
      if (lightboxDesc) lightboxDesc.textContent = initData.desc;
      if (lightboxCategory) lightboxCategory.textContent = initData.cat;
      if (lightboxCounter) lightboxCounter.textContent = `${activeSlideIdx + 1} / ${slidesData.length}`;

      // Inisialisasi Swiper di dalam Lightbox
      if (typeof Swiper !== 'undefined') {
        lightboxSwiperInstance = new Swiper('#lightboxSwiper', {
          initialSlide: activeSlideIdx,
          loop: true,
          speed: 400,
          grabCursor: true,
          keyboard: {
            enabled: true,
          },
          navigation: {
            nextEl: '#lightboxNext',
            prevEl: '#lightboxPrev',
          },
          pagination: {
            el: '#lightboxPagination',
            clickable: true,
          },
          on: {
            slideChange: function () {
              const realIdx = this.realIndex;
              const data = slidesData[realIdx];
              if (data) {
                if (lightboxTitle) lightboxTitle.textContent = data.title;
                if (lightboxDesc) lightboxDesc.textContent = data.desc;
                if (lightboxCategory) lightboxCategory.textContent = data.cat;
                if (lightboxCounter) lightboxCounter.textContent = `${realIdx + 1} / ${slidesData.length}`;

                // Sinkronkan slide luar agar selaras
                if (window.mainGallerySwiper && typeof window.mainGallerySwiper.slideToLoop === 'function') {
                  window.mainGallerySwiper.slideToLoop(realIdx);
                }
              }
            }
          }
        });
      }
    } else {
      // Single photo item
      const imgSrc = item.getAttribute('data-src') || item.querySelector('img')?.src || '';
      const title = item.getAttribute('data-title') || 'Dokumentasi Kegiatan';
      const desc = item.getAttribute('data-desc') || '';
      const category = item.getAttribute('data-cat-label') || 'Kegiatan';

      if (lightboxSwiperWrapper) {
        lightboxSwiperWrapper.innerHTML = `
          <div class="swiper-slide">
            <div class="lightbox-slide-img-wrap">
              <img src="${imgSrc}" alt="${title}" />
            </div>
          </div>
        `;
      }

      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxDesc) lightboxDesc.textContent = desc;
      if (lightboxCategory) lightboxCategory.textContent = category;
      if (lightboxPagination) lightboxPagination.style.display = 'none';

      if (lightboxCounter) {
        lightboxCounter.style.display = 'inline-flex';
        lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${interactiveItems.length}`;
      }
      if (lightboxPrev) lightboxPrev.style.display = 'flex';
      if (lightboxNext) lightboxNext.style.display = 'flex';

      if (typeof Swiper !== 'undefined') {
        lightboxSwiperInstance = new Swiper('#lightboxSwiper', {
          loop: false,
          allowTouchMove: false
        });
      }
    }

    if (lightbox) {
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (lightboxSwiperInstance) {
      lightboxSwiperInstance.destroy(true, true);
      lightboxSwiperInstance = null;
    }
    // Lanjutkan autoplay slider luar saat lightbox ditutup
    if (window.mainGallerySwiper && window.mainGallerySwiper.autoplay) {
      window.mainGallerySwiper.autoplay.start();
    }
  }

  interactiveItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // Abaikan jika mengklik kontrol navigasi atau pagination swiper luar
      if (e.target.closest('.swiper-button-next, .swiper-button-prev, .swiper-pagination')) {
        return;
      }
      openLightbox(index);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Tombol navigasi prev & next untuk single photo
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      // Jika saat ini multi-slide swiper aktif dan loop, Swiper yang menangani
      if (lightboxSwiperInstance && lightboxSwiperInstance.params && lightboxSwiperInstance.params.loop) {
        return;
      }
      e.stopPropagation();
      const nextIdx = (currentGalleryIndex + 1) % interactiveItems.length;
      openLightbox(nextIdx);
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      // Jika saat ini multi-slide swiper aktif dan loop, Swiper yang menangani
      if (lightboxSwiperInstance && lightboxSwiperInstance.params && lightboxSwiperInstance.params.loop) {
        return;
      }
      e.stopPropagation();
      const prevIdx = (currentGalleryIndex - 1 + interactiveItems.length) % interactiveItems.length;
      openLightbox(prevIdx);
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      // Jika bukan multi-slide swiper (single photo), pindah ke item berikutnya
      if (!lightboxSwiperInstance || !lightboxSwiperInstance.params || !lightboxSwiperInstance.params.loop) {
        const nextIdx = (currentGalleryIndex + 1) % interactiveItems.length;
        openLightbox(nextIdx);
      }
    } else if (e.key === 'ArrowLeft') {
      // Jika bukan multi-slide swiper (single photo), pindah ke item sebelumnya
      if (!lightboxSwiperInstance || !lightboxSwiperInstance.params || !lightboxSwiperInstance.params.loop) {
        const prevIdx = (currentGalleryIndex - 1 + interactiveItems.length) % interactiveItems.length;
        openLightbox(prevIdx);
      }
    }
  });

  // 6. COPY EMAIL CLIPBOARD & TOAST
  const copyButtons = document.querySelectorAll('.btn-copy');
  const toast = document.getElementById('toastNotice');
  const toastText = document.getElementById('toastText');

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-clipboard') || 'weldoravendraputra2018@gmail.com';
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('✓ Email berhasil disalin ke papan klip!');
      }).catch(() => {
        // Fallback
        const tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('✓ Email berhasil disalin ke papan klip!');
      });
    });
  });
});
