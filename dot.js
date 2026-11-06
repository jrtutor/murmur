// The red dot guides the page. It lands as each headline's period and bounces between them as you scroll.
// Click it to go to the next stop. Everything here is skipped with reduced motion, leaving plain red periods.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ball = document.getElementById("ball"), root = document.documentElement;
  var stopsEls = [document.getElementById("heroRec")].concat([].slice.call(document.querySelectorAll("main .dot, .closer .dot, section .dot"))).filter(function (e, i, a) { return a.indexOf(e) === i; });
  var stops = [], cur = null, target = { x: 0, y: 0, s: 1, sq: 1 }, raf = 0, vh = innerHeight;
  var LINE = 0.4, HOLD = 0.14;     // docking height in the viewport, and how long it rests at each stop

  function measure() {
    vh = innerHeight;
    var y0 = scrollY, max = root.scrollHeight - vh;
    stops = stopsEls.map(function (el) {
      var r = el.getBoundingClientRect(), hero = el.id === "heroRec";
      var fs = parseFloat(getComputedStyle(el).fontSize);
      return { el: el, x: r.left + r.width / 2, y: y0 + (hero ? r.top + r.height / 2 : r.bottom - fs * 0.255), size: hero ? r.width : fs * 0.17 };
    });
    var last = -1;
    stops.forEach(function (p) { p.at = Math.min(max, Math.max(0, p.y - vh * LINE)); if (p.at <= last) p.at = last + 1; last = p.at; });
    place();
  }
  function ease(t) { return t * t * (3 - 2 * t); }
  function place() {
    var s = scrollY, i = 0;
    while (i < stops.length - 1 && s >= stops[i + 1].at) i++;
    var a = stops[i], b = stops[i + 1];
    var t = b ? (s - a.at) / (b.at - a.at) : 0;
    if (s < stops[0].at || !b || t <= HOLD) { dock(s < stops[0].at ? stops[0] : a, s); return; }
    if (t >= 1 - HOLD) { dock(b, s); return; }
    var u = (t - HOLD) / (1 - 2 * HOLD);
    var dy = a.y + (b.y - a.y) * u - s;
    var hop = Math.abs(Math.sin(Math.PI * 3 * u)) * (1 - 0.55 * u) * Math.min(170, vh * 0.2);
    var floor = 1 - Math.min(1, Math.abs(Math.sin(Math.PI * 3 * u)) * 7);   // squash near each bounce
    target = { x: a.x + (b.x - a.x) * ease(u), y: dy - hop, size: 30, sq: floor, free: true };
    paint();
  }
  function dock(p, s) { target = { x: p.x, y: p.y - s, size: p.size, sq: 0, free: false }; paint(); }
  function paint() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame() {
    raf = 0;
    if (!cur) cur = { x: target.x, y: target.y, size: target.size };
    var k = target.free ? 0.3 : 0.45;
    cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k; cur.size += (target.size - cur.size) * 0.25;
    if (!target.free && Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) < 40) { cur.x = target.x; cur.y = target.y; }
    var sc = cur.size / 30, sx = sc * (1 + target.sq * 0.22), sy = sc * (1 - target.sq * 0.25);
    ball.style.transform = "translate(" + cur.x.toFixed(1) + "px," + cur.y.toFixed(1) + "px) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
    if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) + Math.abs(target.size - cur.size) > 0.3) raf = requestAnimationFrame(frame);
  }
  function go(p) { scrollTo({ top: p.at, behavior: "smooth" }); }

  ball.addEventListener("click", function () {
    var s = scrollY + 4;
    var next = stops.filter(function (p) { return p.at > s; })[0];
    go(next || stops[0]);
  });
  // Nav links send the dot bouncing to that section's headline.
  [].forEach.call(document.querySelectorAll('.nav a[href^="#"]'), function (link) {
    link.addEventListener("click", function (e) {
      var sec = document.querySelector(link.getAttribute("href"));
      var p = sec && stops.filter(function (q) { return sec.contains(q.el); })[0];
      e.preventDefault();
      go(p || stops[0]);
    });
  });

  root.classList.add("dotted");
  ball.hidden = false;
  addEventListener("scroll", place, { passive: true });
  addEventListener("resize", measure);
  addEventListener("load", measure);
  document.addEventListener("toggle", measure, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);
  measure();
})();

// Promo video: plays muted on its own, with one click for sound.
(function () {
  var v = document.getElementById("promo"), b = document.getElementById("sound");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { var p = v.play(); if (p) p.catch(function () {}); }
  b.addEventListener("click", function () {
    if (v.muted || v.paused) { v.muted = false; v.currentTime = 0; v.controls = true; v.play(); b.hidden = true; }
  });
})();
