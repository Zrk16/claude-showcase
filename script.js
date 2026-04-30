/* Claude · Field Guide — script.js
   GSAP + ScrollTrigger, custom tilt, magnetic cta, draggable rail, counters. */

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Cursor ---------- */
  const cursorEl = document.querySelector("[data-cursor]");
  if (cursorEl && !reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    let tx = 0, ty = 0, x = 0, y = 0;
    let raf = 0;
    const HOVER_SEL = "a, button, [data-tilt], [data-magnetic], .card, .cap, .design, .rail";

    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    const tick = () => {
      x += (tx - x) * 0.5;
      y += (ty - y) * 0.5;
      cursorEl.style.transform = `translate3d(${x - 13}px, ${y - 13}px, 0)`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    addEventListener("pointerdown", () => cursorEl.classList.add("is-press"));
    addEventListener("pointerup",   () => cursorEl.classList.remove("is-press"));

    document.addEventListener("pointerover", (e) => {
      const hit = e.target.closest(HOVER_SEL);
      cursorEl.classList.toggle("is-hover", !!hit);
    });
  } else if (cursorEl) {
    cursorEl.style.display = "none";
    document.body.style.cursor = "auto";
  }

  /* ---------- Nav scrolled state ---------- */
  const nav = document.querySelector("[data-nav]");
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Hero title split ---------- */
  const titleLines = document.querySelectorAll("[data-split] .line");
  titleLines.forEach((line) => {
    const text = line.textContent;
    line.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = text;
    line.appendChild(span);
  });

  if (!reduce && window.gsap) {
    gsap.from("[data-split] .line > span", {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.08,
      ease: "expo.out",
      delay: 0.15,
    });
    gsap.from(".hero__meta > *", { opacity: 0, y: 8, duration: 0.8, stagger: 0.05, ease: "expo.out", delay: 0.5 });
    gsap.from(".hero__lede p", { opacity: 0, y: 12, filter: "blur(6px)", duration: 1.0, ease: "expo.out", delay: 0.7 });
    gsap.from(".hero__plate", { opacity: 0, y: 24, scale: 0.96, duration: 1.4, ease: "expo.out", delay: 0.4 });
    gsap.from(".hero__scroll", { opacity: 0, duration: 1.0, ease: "expo.out", delay: 1.2 });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-revealed"));
  }

  /* ---------- Magnetic ---------- */
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (reduce) return;
    const strength = 0.35;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform .8s var(--spring)";
      el.style.transform = "translate(0,0)";
      setTimeout(() => (el.style.transition = ""), 800);
    });
  });

  /* ---------- Tilt ---------- */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    if (reduce) return;
    const max = 8;
    let rect;
    el.addEventListener("mouseenter", () => { rect = el.getBoundingClientRect(); });
    el.addEventListener("mousemove", (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * max).toFixed(2);
      const ry = (px * max).toFixed(2);
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;

      el.querySelectorAll("[data-depth]").forEach((layer) => {
        const d = parseFloat(layer.dataset.depth || 0);
        layer.style.transform = `translate3d(${px * 24 * d}px, ${py * 24 * d}px, 0)`;
      });
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
      el.querySelectorAll("[data-depth]").forEach((layer) => (layer.style.transform = ""));
    });
  });

  /* ---------- Eye follows cursor ---------- */
  const eyes = document.querySelectorAll("[data-eye]");
  if (eyes.length && !reduce) {
    addEventListener("mousemove", (e) => {
      eyes.forEach((eye) => {
        const r = eye.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.min(8, Math.hypot(dx, dy) / 30);
        const ang = Math.atan2(dy, dx);
        eye.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`;
      });
    });
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  const formatter = new Intl.NumberFormat("en-US");
  counters.forEach((el) => {
    const target = parseInt(el.dataset.to, 10);
    const suffix = el.dataset.suffix || "";
    const soft = el.dataset.soft;
    const numEl = el.querySelector(".counter__num");
    let started = false;

    const animate = () => {
      if (started) return;
      started = true;
      if (reduce || !window.gsap) {
        numEl.textContent = soft ? `1, ${soft}` : formatter.format(target) + suffix;
        return;
      }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 2.2,
        ease: "expo.out",
        onUpdate: () => {
          const v = Math.round(obj.v);
          numEl.textContent = formatter.format(v) + suffix;
        },
        onComplete: () => {
          if (soft) numEl.textContent = `1, ${soft}`;
        },
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { animate(); io.disconnect(); } }), { threshold: 0.4 });
      io.observe(el);
    } else animate();
  });

  /* ---------- Plate parallax on scroll ---------- */
  if (window.gsap && !reduce) {
    gsap.to(".plate__seal", {
      yPercent: -30,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".plate__diagram", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".plate__grid", {
      yPercent: -5,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    /* Chapter title parallax */
    gsap.utils.toArray(".chapter__title").forEach((t) => {
      gsap.from(t.querySelectorAll("span"), {
        y: 32, opacity: 0, filter: "blur(8px)",
        duration: 1.0, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: t, start: "top 82%" },
      });
    });

    /* Cap stagger */
    gsap.from(".cap", {
      y: 26, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: ".capabilities", start: "top 78%" },
    });

    /* Design stagger */
    gsap.from(".design", {
      y: 26, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.07,
      scrollTrigger: { trigger: ".designGrid", start: "top 80%" },
    });

    /* Counter row entrance */
    gsap.from(".counter", {
      y: 18, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: ".counters", start: "top 85%" },
    });

    /* Code feats */
    gsap.from(".codeFeat", {
      y: 22, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".codeFeatures", start: "top 82%" },
    });

    /* Colophon giant */
    gsap.from(".colophon__giant span", {
      yPercent: 30, opacity: 0, filter: "blur(12px)",
      duration: 1.6, ease: "expo.out",
      scrollTrigger: { trigger: ".colophon__giant", start: "top 90%" },
    });
  }

  /* ---------- Terminal row reveal ---------- */
  const stream = document.querySelector("[data-stream]");
  if (stream) {
    const rows = stream.querySelectorAll(".t-row");
    if (reduce) {
      rows.forEach(r => r.classList.add("is-in"));
    } else {
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        rows.forEach((row, i) => {
          setTimeout(() => row.classList.add("is-in"), 180 + i * 220);
        });
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((es) => es.forEach(e => {
          if (e.isIntersecting) { play(); io.disconnect(); }
        }), { threshold: 0.3 });
        io.observe(stream);
      } else play();
    }
  }

  /* ---------- Draggable rail ---------- */
  const rail = document.querySelector("[data-rail]");
  const track = document.querySelector("[data-rail-track]");
  if (rail && track) {
    let pos = 0, target = 0, max = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartPos = 0;
    let velocity = 0;
    let lastX = 0;
    let lastT = 0;

    const measure = () => {
      max = track.scrollWidth - rail.clientWidth + 24;
      if (max < 0) max = 0;
      target = clamp(target, -max, 0);
    };
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    measure();
    addEventListener("resize", measure);

    const apply = () => {
      pos += (target - pos) * 0.12;
      if (Math.abs(velocity) > 0.05 && !dragging) {
        target = clamp(target + velocity, -max, 0);
        velocity *= 0.92;
      }
      track.style.transform = `translate3d(${pos}px,0,0)`;
      requestAnimationFrame(apply);
    };
    apply();

    const onDown = (e) => {
      dragging = true;
      rail.classList.add("is-grabbing");
      dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
      dragStartPos = target;
      lastX = dragStartX; lastT = performance.now();
      velocity = 0;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = x - dragStartX;
      target = clamp(dragStartPos + dx, -max, 0);
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (x - lastX) / dt * 16;
      lastX = x; lastT = now;
    };
    const onUp = () => {
      dragging = false;
      rail.classList.remove("is-grabbing");
    };

    rail.addEventListener("mousedown", onDown);
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", onUp);
    rail.addEventListener("touchstart", onDown, { passive: true });
    rail.addEventListener("touchmove", onMove, { passive: true });
    rail.addEventListener("touchend", onUp);

    rail.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      target = clamp(target - e.deltaX, -max, 0);
    }, { passive: false });

    addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") target = clamp(target - 340, -max, 0);
      if (e.key === "ArrowLeft")  target = clamp(target + 340, -max, 0);
    });
  }

  /* ---------- Smooth anchor links ---------- */
  document.querySelectorAll('[data-link]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
