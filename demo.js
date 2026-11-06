// In-browser demo of the Murmur flow. Every pair below is real output from `Murmur --cleanup-test`.
(function () {
  var demos = [
    ["um so uh the meeting is Tuesday no wait Wednesday", "The meeting is Wednesday."],
    ["I need to I need to call the the vendor about the invoice", "I need to call the vendor about the invoice"],
    ["three things first the logo second the copy third the page", "Three things:\n- The logo\n- The copy\n- The page"]
  ];
  var $ = function (id) { return document.getElementById(id); };
  var fn = $("fn"), hint = $("hint"), said = $("saidText"), typed = $("typed"), pill = $("pill"), bars = $("bars"), word = $("pillWord");
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = "idle", index = 0, lastTap = 0, timers = [];

  var mint = [124, 245, 200], blue = [91, 140, 255], N = 18;
  for (var i = 0; i < N; i++) {
    var bar = document.createElement("i"), t = i / (N - 1);
    bar.style.background = "rgb(" + mint.map(function (c, j) { return Math.round(c + (blue[j] - c) * t); }).join(",") + ")";
    bars.appendChild(bar);
  }
  function wiggle() {
    Array.prototype.forEach.call(bars.children, function (b, i) {
      b.style.height = (still ? 10 + (i * 7) % 22 : 8 + Math.random() * 26) + "px";
    });
  }
  function clear() { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; }

  function listen() {
    state = "listening";
    var demo = demos[index], words = demo[0].split(" "), shown = 0;
    typed.textContent = "\u00a0"; said.textContent = "";
    pill.hidden = false; pill.classList.remove("busy"); word.hidden = true;
    hint.textContent = "Listening. Tap fn to finish.";
    wiggle();
    if (still) { said.textContent = demo[0]; return; }
    timers.push(setInterval(wiggle, 120));
    (function next() {
      if (shown >= words.length) return;
      said.textContent = words.slice(0, ++shown).join(" ");
      timers.push(setTimeout(next, 190));
    })();
  }
  function finish() {
    state = "busy"; clear();
    said.textContent = demos[index][0];
    pill.classList.add("busy"); word.hidden = false;
    hint.textContent = "One moment.";
    timers.push(setTimeout(function () {
      pill.hidden = true;
      typed.textContent = demos[index][1];
      index = (index + 1) % demos.length;
      state = "idle";
      hint.textContent = "Double-tap fn to try another.";
    }, 550));
  }
  fn.addEventListener("click", function () {
    var now = Date.now();
    fn.classList.add("down");
    setTimeout(function () { fn.classList.remove("down"); }, 90);
    if (state === "listening") return finish();
    if (state !== "idle") return;
    if (now - lastTap < 500) { lastTap = 0; listen(); }
    else { lastTap = now; hint.textContent = "Once more."; setTimeout(function () { if (state === "idle" && lastTap === now) hint.textContent = "Double-tap fn to try it."; }, 700); }
  });
})();
