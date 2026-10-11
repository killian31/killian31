// Halftone portrait: one dot per grid cell, sized by how dark the photo is there.
// On load the dots print in from top to bottom; afterwards they flee the pointer and spring back.
(() => {
  const cv = document.getElementById('portrait');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const img = new Image();
  img.src = 'assets/profile/profile-picture.jpg';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const darkMq = matchMedia('(prefers-color-scheme: dark)');
  let dots = [], W = 0, H = 0, ink = '', ptr = null, raf = 0, t0 = 0;
  const PRINT_MS = 1100;

  function build() {
    const dpr = devicePixelRatio || 1, box = cv.getBoundingClientRect();
    W = cv.width = Math.round(box.width * dpr);
    H = cv.height = Math.round(box.height * dpr);
    ink = getComputedStyle(cv).color;
    // Dark mode prints light ink on blue, so dots mark the light parts of the photo instead.
    const dark = darkMq.matches;
    const step = Math.max(5, W / 42);
    const cols = Math.ceil(W / step), rows = Math.ceil(H / step);
    const s = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    s.canvas.width = cols; s.canvas.height = rows;
    s.drawImage(img, 0, 0, cols, rows);
    const px = s.getImageData(0, 0, cols, rows).data;
    dots = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 4;
      const lum = (0.3 * px[k] + 0.59 * px[k + 1] + 0.11 * px[k + 2]) / 255;
      const r = (dark ? lum : 1 - lum) ** 1.2 * step * 0.62;
      if (r < 0.4) continue;
      const hx = (i + 0.5) * step + (j % 2 ? step / 2 : 0), hy = (j + 0.5) * step;
      dots.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, r, delay: (hy / H) * 0.6 + Math.random() * 0.15 });
    }
  }

  function draw(now) {
    const p = still ? 1 : Math.min(1, (now - t0) / PRINT_MS);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (const d of dots) {
      const q = p >= 1 ? 1 : Math.max(0, Math.min(1, (p - d.delay) / 0.25));
      if (!q) continue;
      const r = d.r * (1 - (1 - q) ** 3);
      ctx.moveTo(d.x + r, d.y);
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
    }
    ctx.fill();
    return p < 1;
  }

  function tick(now) {
    let moving = false;
    const R = W * 0.22;
    for (const d of dots) {
      if (ptr) {
        const dx = d.x - ptr.x, dy = d.y - ptr.y, dist = Math.hypot(dx, dy) || 1;
        if (dist < R) { const f = (1 - dist / R) * 2.2; d.vx += (dx / dist) * f; d.vy += (dy / dist) * f; }
      }
      d.vx = (d.vx + (d.hx - d.x) * 0.06) * 0.82;
      d.vy = (d.vy + (d.hy - d.y) * 0.06) * 0.82;
      d.x += d.vx; d.y += d.vy;
      if (Math.abs(d.vx) + Math.abs(d.vy) > 0.05) moving = true;
    }
    const printing = draw(now);
    raf = moving || printing || ptr ? requestAnimationFrame(tick) : 0;
  }

  function start() {
    build();
    lastW = cv.getBoundingClientRect().width;
    t0 = performance.now();
    if (still) draw(t0);
    else if (!raf) raf = requestAnimationFrame(tick);
  }

  if (!still) {
    cv.addEventListener('pointermove', e => {
      const box = cv.getBoundingClientRect(), k = W / box.width;
      ptr = { x: (e.clientX - box.left) * k, y: (e.clientY - box.top) * k };
      if (!raf) raf = requestAnimationFrame(tick);
    });
    cv.addEventListener('pointerleave', () => { ptr = null; });
  }

  let lastW = 0;
  const redraw = (force) => {
    const w = cv.getBoundingClientRect().width;
    if (!img.complete || !dots.length || (w === lastW && force !== true)) return;
    lastW = w; build(); draw(Infinity);
  };
  img.onload = start;
  if (img.complete && img.naturalWidth) start();
  new ResizeObserver(redraw).observe(cv);
  darkMq.addEventListener('change', () => redraw(true));
})();
