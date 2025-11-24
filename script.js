document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const closeMenuBtn = document.querySelector(".close-menu-btn");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".nav-mobile a");

  function toggleMenu() {
    mobileMenuOverlay.classList.toggle("active");
    document.body.style.overflow = mobileMenuOverlay.classList.contains(
      "active"
    )
      ? "hidden"
      : "";
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", toggleMenu);

  // Close menu when clicking a link
  mobileLinks.forEach((link) => {
    link.addEventListener("click", toggleMenu);
  });

  const audioCards = document.querySelectorAll(".audio-card");
  const audioElements = document.querySelectorAll(".demo-audio");

  function stopAll(except) {
    audioElements.forEach((audio) => {
      if (audio !== except) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  function resetCards(exceptCard) {
    audioCards.forEach((card) => {
      if (card !== exceptCard) {
        card.classList.remove("is-playing");
        const icon = card.querySelector(".play-btn i");
        if (icon) {
          icon.classList.remove("fa-pause");
          icon.classList.add("fa-play");
        }
      }
    });
  }

  // Generate waveform bars dynamically based on audio duration
  function generateWaveform(waveformContainer, duration) {
    // Calculate number of bars based on duration (1 bar per 2-3 seconds, min 20, max 100)
    const barsCount = Math.min(Math.max(Math.ceil(duration / 2.5), 20), 100);

    waveformContainer.innerHTML = "";

    for (let i = 0; i < barsCount; i++) {
      const bar = document.createElement("div");
      bar.className = "waveform-bar";
      bar.dataset.index = i;
      waveformContainer.appendChild(bar);
    }
  }

  // Update waveform progress
  function updateWaveformProgress(waveformContainer, progress) {
    const bars = waveformContainer.querySelectorAll(".waveform-bar");
    const activeBarsCount = Math.floor(bars.length * progress);

    bars.forEach((bar, index) => {
      if (index < activeBarsCount) {
        bar.classList.add("active");
      } else {
        bar.classList.remove("active");
      }
    });
  }

  audioCards.forEach((card) => {
    const button = card.querySelector(".play-btn");
    const icon = button?.querySelector("i");
    const audio = card.querySelector(".demo-audio");
    const waveform = card.querySelector(".waveform");

    if (!button || !audio || !icon || !waveform) return;

    // Generate waveform when metadata is loaded
    audio.addEventListener("loadedmetadata", () => {
      generateWaveform(waveform, audio.duration);
    });

    // If metadata already loaded (cached), generate immediately
    if (audio.readyState >= 1) {
      generateWaveform(waveform, audio.duration);
    }

    // Update waveform progress as audio plays
    audio.addEventListener("timeupdate", () => {
      const progress = audio.currentTime / audio.duration;
      updateWaveformProgress(waveform, progress);
    });

    // Click on waveform to seek
    waveform.addEventListener("click", (e) => {
      if (!waveform.dataset.clickable) return;

      const rect = waveform.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = clickX / rect.width;
      audio.currentTime = progress * audio.duration;
    });

    // Add hover effect on waveform
    waveform.addEventListener("mousemove", (e) => {
      if (!waveform.dataset.clickable) return;

      const rect = waveform.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const hoverProgress = hoverX / rect.width;
      const bars = waveform.querySelectorAll(".waveform-bar");
      const hoverBarIndex = Math.floor(bars.length * hoverProgress);

      bars.forEach((bar, index) => {
        if (index <= hoverBarIndex) {
          bar.classList.add("hover");
        } else {
          bar.classList.remove("hover");
        }
      });
    });

    waveform.addEventListener("mouseleave", () => {
      const bars = waveform.querySelectorAll(".waveform-bar");
      bars.forEach((bar) => bar.classList.remove("hover"));
    });

    button.addEventListener("click", () => {
      if (audio.paused) {
        stopAll(audio);
        resetCards(card);
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    audio.addEventListener("play", () => {
      card.classList.add("is-playing");
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    });

    audio.addEventListener("pause", () => {
      card.classList.remove("is-playing");
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    });

    audio.addEventListener("ended", () => {
      card.classList.remove("is-playing");
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
      audio.currentTime = 0;
      updateWaveformProgress(waveform, 0);
    });
  });

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  const navLinks = document.querySelectorAll(
    '.nav-desktop a[href^="#"]:not(.btn), .nav-mobile a[href^="#"]'
  );

  let currentActiveNav = null;
  function setActiveNav(targetId) {
    if (!targetId || currentActiveNav === targetId) return;
    currentActiveNav = targetId;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (href === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  const trackedSections = [
    ...new Set(
      Array.from(navLinks)
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.startsWith("#") && href.length > 1)
    ),
  ]
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  if (trackedSections.length) {
    const header = document.querySelector(".header");
    const getHeaderOffset = () => (header?.offsetHeight || 0) + 10;

    const getActiveSectionId = () => {
      const scrollPosition = window.scrollY + getHeaderOffset();
      let activeId = trackedSections[0]?.id;

      trackedSections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          activeId = section.id;
        }
      });

      return activeId ? `#${activeId}` : null;
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setActiveNav(getActiveSectionId());
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
  }

  const partnerSwiperEl = document.querySelector(".partners-swiper");
  if (partnerSwiperEl && typeof Swiper !== "undefined") {
    new Swiper(partnerSwiperEl, {
      slidesPerView: 4,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".partners-carousel .swiper-button-next",
        prevEl: ".partners-carousel .swiper-button-prev",
      },
      breakpoints: {
        0: { slidesPerView: 1.5 },
        576: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
        1400: { slidesPerView: 6 },
      },
    });
  }

  const videoCards = document.querySelectorAll(".video-card[data-video-id]");

  videoCards.forEach((card) => {
    const playBtn = card.querySelector(".video-play-btn");
    const thumbnail = card.querySelector(".video-thumbnail");
    const videoId = card.dataset.videoId;

    if (!playBtn || !thumbnail || !videoId) return;

    function embedVideo() {
      if (card.classList.contains("video-playing")) return;

      const iframeWrapper = document.createElement("div");
      iframeWrapper.className = "video-embed";

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = "Video player";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      iframeWrapper.appendChild(iframe);
      thumbnail.replaceWith(iframeWrapper);
      card.classList.add("video-playing");
      card.style.cursor = "default";
    }

    playBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      embedVideo();
    });

    card.addEventListener("click", () => {
      embedVideo();
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    if (!question) return;

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherQuestion = otherItem.querySelector(".faq-question");
          if (otherQuestion) {
            otherQuestion.setAttribute("aria-expanded", "false");
          }
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
});
