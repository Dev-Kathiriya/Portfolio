/* ============================================================
   Dev Kathiriya — Portfolio scripts
   ============================================================ */

(() => {
  "use strict";

  /* ----- Year in footer ----- */
  const yearEl = document.querySelector("#year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ----- Theme toggle ----- */
  const themeToggle = document.querySelector("#theme-toggle");
  const storedTheme = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = storedTheme || (prefersLight ? "light" : "dark");

  document.documentElement.setAttribute("data-theme", initialTheme);

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ----- Mobile nav ----- */
  const navToggle = document.querySelector("#nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navLinks = document.querySelectorAll("#site-nav a");

  navToggle?.addEventListener("click", () => {
    const isOpen = siteNav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* ----- Sticky header shadow on scroll ----- */
  const header = document.querySelector(".site-header");
  const updateHeader = () => {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ----- Scroll spy ----- */
  const sections = [...document.querySelectorAll("main section[id]")];
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${id}`
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ----- Reveal-on-scroll ----- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            setTimeout(() => el.classList.add("is-visible"), index * 70);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ----- Counter animations ----- */
  const counters = document.querySelectorAll(".stat-value[data-count]");
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1600;
    const startTime = performance.now();

    const formatValue = (value) => {
      if (decimals > 0) {
        return value.toFixed(decimals);
      }
      if (target >= 1000) {
        const k = value / 1000;
        if (target >= 1000) {
          return `${Math.round(k)}K`;
        }
      }
      return Math.round(value).toLocaleString();
    };

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = `${formatValue(current)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${formatValue(target)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* ----- Typewriter rotator ----- */
  const rotator = document.querySelector(".rotator");
  if (rotator) {
    const words = [
      "ML systems",
      "data pipelines",
      "mobile apps",
      "full-stack products",
      "things people use",
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex++;
        rotator.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        charIndex--;
        rotator.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      const delay = deleting ? 45 : 85;
      setTimeout(tick, delay);
    };

    tick();
  }

  /* ----- Back to top ----- */
  const backToTop = document.querySelector(".back-to-top");
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const initInfiniteCarousel = ({
    root,
    track,
    itemSelector,
    ariaLabel,
    itemLabel,
  }) => {
    if (!root || !track) return;

    const mql = window.matchMedia("(max-width: 720px)");
    const reduceMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const AUTO_INTERVAL = 5000;
    const RESUME_DELAY = 7000;
    const SCROLL_END_DEBOUNCE = 140;
    const CLONE_CLASS = "carousel-clone";

    const getRealItems = () =>
      [...track.querySelectorAll(itemSelector)].filter(
        (item) => !item.classList.contains(CLONE_CLASS)
      );

    let realItems = getRealItems();
    if (realItems.length === 0) return;

    let domCards = [...realItems];
    let cloneHead = null;
    let cloneTail = null;
    let activeDomIndex = 0;
    let dotsContainer = null;
    let dots = [];
    let autoTimer = null;
    let resumeTimer = null;
    let scrollDebounce = null;
    let userInteracting = false;
    let isAdjusting = false;

    const inCarouselMode = () => mql.matches;
    const hasClones = () => Boolean(cloneHead && cloneTail);
    const realCount = () => realItems.length;
    const logicalIndex = () =>
      hasClones() ? activeDomIndex - 1 : activeDomIndex;

    const setActiveDot = (index) => {
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    const setupClones = () => {
      if (cloneHead) {
        cloneHead.remove();
        cloneHead = null;
      }
      if (cloneTail) {
        cloneTail.remove();
        cloneTail = null;
      }

      realItems = getRealItems();
      domCards = [...realItems];

      if (!inCarouselMode() || realItems.length < 2) return;

      cloneHead = realItems[realItems.length - 1].cloneNode(true);
      cloneTail = realItems[0].cloneNode(true);
      [cloneHead, cloneTail].forEach((clone) => {
        clone.classList.add(CLONE_CLASS);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a, button").forEach((el) =>
          el.setAttribute("tabindex", "-1")
        );
      });

      track.insertBefore(cloneHead, realItems[0]);
      track.appendChild(cloneTail);
      domCards = [cloneHead, ...realItems, cloneTail];
    };

    const logicalToDomIndex = (index) => (hasClones() ? index + 1 : index);

    const findClosestDomIndex = () => {
      const gridRect = track.getBoundingClientRect();
      const center = gridRect.left + gridRect.width / 2;
      let closestDom = 0;
      let closestDistance = Infinity;

      domCards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestDom = i;
        }
      });

      return closestDom;
    };

    const scrollToDom = (domIndex, smooth = true) => {
      const card = domCards[domIndex];
      if (!card) return;

      const gridRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cardLeftInContent =
        cardRect.left - gridRect.left + track.scrollLeft;
      const left =
        cardLeftInContent - (gridRect.width - cardRect.width) / 2;

      track.scrollTo({
        left,
        behavior: smooth ? "smooth" : "auto",
      });
    };

    const jumpToDom = (domIndex) => {
      isAdjusting = true;
      clearTimeout(scrollDebounce);
      track.classList.add("is-adjusting");
      activeDomIndex = domIndex;
      scrollToDom(domIndex, false);
      setActiveDot(logicalIndex());
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.classList.remove("is-adjusting");
          isAdjusting = false;
        });
      });
    };

    const settle = () => {
      if (!inCarouselMode() || domCards.length === 0 || isAdjusting) return;

      const closestDom = findClosestDomIndex();
      const lastDom = domCards.length - 1;

      if (hasClones() && closestDom === 0) {
        jumpToDom(realCount());
        return;
      }

      if (hasClones() && closestDom === lastDom) {
        jumpToDom(1);
        return;
      }

      activeDomIndex = closestDom;
      setActiveDot(logicalIndex());
    };

    const moveBy = (offset) => {
      if (!inCarouselMode() || domCards.length === 0 || isAdjusting) return;
      const currentDom = findClosestDomIndex();
      const nextDom = currentDom + offset;
      if (nextDom < 0 || nextDom > domCards.length - 1) return;
      scrollToDom(nextDom, true);
    };

    const goToLogical = (index, smooth = true) => {
      if (index < 0 || index >= realCount()) return;
      activeDomIndex = logicalToDomIndex(index);
      scrollToDom(activeDomIndex, smooth);
      setActiveDot(index);
    };

    const scheduleSettle = () => {
      if (!inCarouselMode() || isAdjusting) return;
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(settle, SCROLL_END_DEBOUNCE);
    };

    if ("onscrollend" in window) {
      track.addEventListener("scrollend", settle, { passive: true });
    }
    track.addEventListener("scroll", scheduleSettle, { passive: true });

    const buildDots = () => {
      if (dotsContainer) {
        dotsContainer.remove();
        dotsContainer = null;
        dots = [];
      }
      if (!inCarouselMode()) return;

      dotsContainer = document.createElement("div");
      dotsContainer.className = "carousel-dots";
      dotsContainer.setAttribute("role", "tablist");
      dotsContainer.setAttribute("aria-label", ariaLabel);

      realItems.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", itemLabel(i, realItems.length));
        dot.addEventListener("click", () => {
          userInteracting = true;
          goToLogical(i, true);
          pauseAuto();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });

      root.appendChild(dotsContainer);
      setActiveDot(logicalIndex());
    };

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    const startAuto = () => {
      stopAuto();
      if (!inCarouselMode() || reduceMotionMql.matches || realCount() < 2) return;
      autoTimer = setInterval(() => {
        if (userInteracting || isAdjusting) return;
        moveBy(1);
      }, AUTO_INTERVAL);
    };

    const pauseAuto = () => {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        userInteracting = false;
        startAuto();
      }, RESUME_DELAY);
    };

    const markInteracting = () => {
      userInteracting = true;
      pauseAuto();
    };

    track.addEventListener("touchstart", markInteracting, { passive: true });
    track.addEventListener("pointerdown", markInteracting);
    track.addEventListener("wheel", markInteracting, { passive: true });

    const init = () => {
      setupClones();
      buildDots();

      if (inCarouselMode()) {
        activeDomIndex = logicalToDomIndex(0);
        requestAnimationFrame(() => {
          scrollToDom(activeDomIndex, false);
          setActiveDot(0);
          startAuto();
        });
      } else {
        activeDomIndex = 0;
        stopAuto();
        clearTimeout(resumeTimer);
      }
    };

    init();

    const handleMqlChange = () => init();
    if (mql.addEventListener) {
      mql.addEventListener("change", handleMqlChange);
    } else if (mql.addListener) {
      mql.addListener(handleMqlChange);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAuto();
      } else if (inCarouselMode()) {
        startAuto();
      }
    });

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!inCarouselMode()) return;
            if (entry.isIntersecting) {
              if (!userInteracting) startAuto();
            } else {
              stopAuto();
            }
          });
        },
        { threshold: 0.25 }
      );
      visibilityObserver.observe(root);
    }
  };

  initInfiniteCarousel({
    root: document.querySelector("#apps .app-carousel"),
    track: document.querySelector("#apps .app-grid"),
    itemSelector: ".app-card",
    ariaLabel: "Apps carousel pagination",
    itemLabel: (index, total) => `Show app ${index + 1} of ${total}`,
  });

  initInfiniteCarousel({
    root: document.querySelector("#projects .project-carousel"),
    track: document.querySelector("#projects .project-grid"),
    itemSelector: ".project-card",
    ariaLabel: "Projects carousel pagination",
    itemLabel: (index, total) => `Show project ${index + 1} of ${total}`,
  });
})();
