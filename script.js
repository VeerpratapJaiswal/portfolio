lucide.createIcons();

// Custom cursor + hover enlarge (desktop only)
(() => {
  const cur = document.getElementById("cur");
  const curT = document.getElementById("curT");
  if (!cur || !curT) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + "px";
    cur.style.top = my + "px";
  });

  (function loop() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    curT.style.left = tx + "px";
    curT.style.top = ty + "px";
    requestAnimationFrame(loop);
  })();

  const hoverTargets = () =>
    document.querySelectorAll("a,button,.project-card,.timeline-card,.skill-card,.list-card,.contact-link");
  hoverTargets().forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cur.style.width = "14px";
      cur.style.height = "14px";
      curT.style.width = "46px";
      curT.style.height = "46px";
    });
    el.addEventListener("mouseleave", () => {
      cur.style.width = "8px";
      cur.style.height = "8px";
      curT.style.width = "30px";
      curT.style.height = "30px";
    });
  });
})();

// Hero rotating roles (minimal)
(() => {
  const el = document.querySelector("[data-rotating]");
  if (!el) return;

  const roles = ["Data Analyst", "Data Scientist", "Power BI Developer", "AI/ML Engineer"];
  let i = 0;

  setInterval(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";

    setTimeout(() => {
    i = (i + 1) % roles.length;
    el.textContent = roles[i];
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 170);
  }, 1800);
})();

// Reveal on scroll
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  // Alternate reveal direction for a nicer scroll rhythm.
  els.forEach((el, idx) => {
    el.classList.add(idx % 2 === 0 ? "reveal-left" : "reveal-right");
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
})();

// Section heading character animation (once in view)
(() => {
  const headings = document.querySelectorAll(".container h2");
  if (!headings.length) return;

  const splitHeading = (node) => {
    if (node.dataset.animated === "true") return;
    const text = node.textContent.trim();
    node.textContent = "";

    [...text].forEach((ch, idx) => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(12px)";
      span.style.transition = "opacity .38s ease, transform .38s ease";
      span.style.transitionDelay = `${idx * 18}ms`;
      node.appendChild(span);
    });
    node.dataset.animated = "true";
  };

  const revealHeading = (node) => {
    node.querySelectorAll("span").forEach((s) => {
      s.style.opacity = "1";
      s.style.transform = "translateY(0)";
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        splitHeading(entry.target);
        requestAnimationFrame(() => revealHeading(entry.target));
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  headings.forEach((h) => io.observe(h));
})();

// Active nav link
(() => {
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const secs = Array.from(document.querySelectorAll("section[id]"));
  if (!links.length || !secs.length) return;

  function onScroll() {
    let current = "";
    const y = window.scrollY;
    for (const s of secs) {
      if (y >= s.offsetTop - 140) current = s.id;
    }
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// Projects: filters + lightweight Power BI preview
(() => {
  const grid = document.querySelector("[data-projects-grid]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".project-card"));
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));

  function setActive(btn) {
    buttons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function applyFilter(filter) {
    cards.forEach((card) => {
      const category = (card.getAttribute("data-category") || "").toLowerCase();
      const visible = filter === "all" || category === filter;
      card.style.display = visible ? "" : "none";
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.getAttribute("data-filter") || "all").toLowerCase();
      setActive(btn);
      applyFilter(filter);
    });
  });

  // Embed toggle (keeps page fast by default)
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-embed-toggle]");
    if (!btn) return;

    const card = btn.closest(".project-card");
    if (!card) return;

    const url = btn.getAttribute("data-embed-url");
    if (!url) return;

    const existing = card.querySelector("iframe.project-embed");
    if (existing) {
      existing.remove();
      btn.textContent = "Quick Preview";
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.className = "project-embed";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.allowFullscreen = true;
    iframe.src = url;

    const body = card.querySelector(".project-body");
    if (body) body.insertAdjacentElement("beforebegin", iframe);
    btn.textContent = "Hide Preview";
  });

  applyFilter("all");
})();

// Scroll Progress
window.addEventListener("scroll", () => {
  let scroll = window.scrollY;
  let height = document.body.scrollHeight - window.innerHeight;
  let progress = (scroll / height) * 100;

  document.querySelector(".scroll-progress").style.width = progress + "%";
});

