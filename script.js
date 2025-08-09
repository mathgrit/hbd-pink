// ================== Helpers ==================
const qs  = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitForTap(target = document.body) {
  return new Promise((resolve) => {
    const handler = () => {
      target.removeEventListener("click", handler);
      resolve();
    };
    target.addEventListener("click", handler, { once: true });
  });
}

function showTap(text = "Ketuk untuk melanjutkan") {
  const tap = qs("#tap");
  if (!tap) return;
  tap.textContent = text;
  tap.classList.remove("d-none");
}
function hideTap() {
  const tap = qs("#tap");
  if (tap) tap.classList.add("d-none");
}

// ================== Audio ==================
async function playOnFirstInteraction() {
  const music = /** @type {HTMLAudioElement} */ (qs("#background-music"));
  if (!music) return;
  try { await music.play(); } catch {}
}

// ====== SFX "duar" ======
function playBoomSFX() {
  const s = /** @type {HTMLAudioElement} */ (document.getElementById("sfx-boom"));
  if (!s) return;
  try {
    s.currentTime = 0;
    s.play().catch(() => {
      // jika diblokir, mainkan pada ketukan berikut
      const once = () => s.play().catch(()=>{});
      document.body.addEventListener("click", once, { once: true });
    });
  } catch {}
}

// ====== Ledakan kertas kiri-kanan ======
function spawnPaperExplosion() {
  const container = document.createElement("div");
  container.className = "paper-explosion";
  document.body.appendChild(container);

  const colors = ["#FF477E", "#F9C74F", "#43AA8B", "#577590", "#F94144", "#90BE6D", "#F3722C", "#277DA1"];
  const pieces = 90;

  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("div");
    el.className = "paper";
    el.style.backgroundColor = colors[i % colors.length];

    const side = i % 2 === 0 ? "left" : "right";
    const dist = 80 + Math.random() * 140;
    const tx = (side === "left" ? 1 : -1) * dist;
    const ty = -40 + Math.random() * 140;
    const rot = (Math.random() * 720 - 360) + "deg";
    const delay = (Math.random() * 0.15) + "s";

    el.style.setProperty("--tx", tx + "px");
    el.style.setProperty("--ty", ty + "px");
    el.style.setProperty("--rz", rot);
    el.style.setProperty("--delay", delay);

    const w = 6 + Math.random() * 6;
    const h = 10 + Math.random() * 10;
    el.style.width = w + "px";
    el.style.height = h + "px";

    container.appendChild(el);
  }

  setTimeout(() => container.remove(), 1600);
}

// gabungan: bunyi + ledakan kertas
function boomAndPaper() {
  playBoomSFX();
  spawnPaperExplosion();
}

// ================== Countdown (moment-timezone) ==================
function startCountdown({ targetISO, tz }, onFinish) {
  const timer     = qs("#timer");
  const daysEl    = qs("#days");
  const hoursEl   = qs("#hours");
  const minutesEl = qs("#minutes");
  const secondsEl = qs("#seconds");

  let id = null;

  function setZero() {
    if (daysEl)    daysEl.textContent = "0";
    if (hoursEl)   hoursEl.textContent = "0";
    if (minutesEl) minutesEl.textContent = "0";
    if (secondsEl) secondsEl.textContent = "0";
  }

  function tick() {
    const now    = moment.tz(tz);
    const target = moment.tz(targetISO, tz);
    const diff   = target.diff(now);

    if (diff <= 0) {
      setZero();
      if (id !== null) clearInterval(id);
      onFinish?.();
      return;
    }

    const d = Math.floor(diff / (24 * 60 * 60 * 1000));
    const h = Math.floor((diff / (60 * 60 * 1000)) % 24);
    const m = Math.floor((diff / (60 * 1000)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (daysEl)    daysEl.textContent = String(d);
    if (hoursEl)   hoursEl.textContent = String(h);
    if (minutesEl) minutesEl.textContent = String(m);
    if (secondsEl) secondsEl.textContent = String(s);
  }

  tick();
  id = setInterval(tick, 1000);
  return id;
}

// ================== TypeIt starters (PROMISE-BASED) ==================
let type1Started = false;
let type2Started = false;
let type1Promise = null;
let type2Promise = null;

// resolve saat selesai mengetik
function startTypeIt1() {
  if (type1Started) return type1Promise;
  type1Started = true;
  type1Promise = new Promise((resolve) => {
    /* global TypeIt */
    new TypeIt("#teks1", {
      strings: [
        "Hari ini, aku langitkan semua doa terbaikku untuk kamu.",
        "Semoga hal-hal yang membuat kamu runtuh turut menjadi alasan kamu untuk tetap tumbuh.",
        "Semoga dunia senantiasa menjaga kamu dimanapun kamu berada.",
        "Semoga hari-hari kamu selalu diiringi cinta yang tak pernah ada batasnya.",
        "Semoga setiap langkahmu dimudahkan hingga tercapai apa yang kamu inginkan.",
      ],
      startDelay: 100,
      speed: 75,
      waitUntilVisible: true,
      afterComplete: () => {
        showTap("Ketuk untuk melanjutkan");
        resolve();
      },
    }).go();
  });
  return type1Promise;
}

function startTypeIt2() {
  if (type2Started) return type2Promise;
  type2Started = true;
  type2Promise = new Promise((resolve) => {
    new TypeIt("#teks2", {
      strings: [
        "Dengan ataupun tanpaku, semoga semesta selalu membahagiakan kamu bagimanapun caranya.",
        "barakallah fi umrik, terima kasih sudah bertahan sampai sejauh ini.",
        "Semoga kamu selalu dikelilingi oleh orang-orang yang mencintaimu.",
        "Semoga kamu selalu menemukan kebahagiaan dalam setiap langkahmu.",
        " ",
        "Wish you all the best",
        " ",
        "-Angga, dengan cinta",
      ],
      startDelay: 100,
      speed: 75,
      waitUntilVisible: true,
      afterComplete: () => {
        showTap("Ketuk untuk lanjut");
        resolve();
      },
    }).go();
  });
  return type2Promise;
}

function startTypeItTrims() {
  new TypeIt("#trims", {
    strings: ["Terimakasih."],
    startDelay: 1200,
    speed: 150,
    loop: false,
    waitUntilVisible: true,
  }).go();
}

// ================== Flow antar slide ==================
// Dipanggil SETELAH ketukan pertama: musik mulai → slide1 keluar → slide2 ngetik (klik baru diizinkan setelah selesai)
async function startFlowAfterFirstTap() {
  const timer = qs("#timer");
  if (timer) timer.classList.add("d-none");

  // animasi keluar slide 1
  const slideSatu = qs("#slideSatu");
  if (slideSatu) {
    slideSatu.classList.replace("animate__slideInDown", "animate__backOutDown");
    await sleep(900);
    slideSatu.classList.add("d-none");
  }

  // --- Slide 2 ---
  const slideDua = qs("#slideDua");
  if (slideDua) slideDua.classList.remove("d-none");

  // MULAI mengetik & TUNGGU SELESAI
  await startTypeIt1();

  // Setelah selesai mengetik → barulah izinkan klik
  await waitForTap();
  hideTap();

  // Keluar Slide 2
  if (slideDua) {
    slideDua.classList.remove("animate__delay-2s", "animate__slow");
    slideDua.classList.replace("animate__zoomInDown", "animate__fadeOutLeft");
    await sleep(900);
    slideDua.remove();
  }

  // --- Slide 3 ---
  const slideTiga = qs("#slideTiga");
  if (slideTiga) slideTiga.classList.remove("d-none");

  await startTypeIt2();

  await waitForTap();
  hideTap();

  if (slideTiga) {
    slideTiga.classList.remove("animate__delay-2s", "animate__slow");
    slideTiga.classList.replace("animate__fadeInRight", "animate__fadeOut");
    await sleep(900);
    slideTiga.remove();
  }

  // Slide 4 (kotak pertanyaan)
  await slideEmpatFlow();

  // Slide 5 (hati + trims)
  await slideLimaFlow();

  // Slide 6 (jika ada di HTML)
  const slideEnam = qs("#slideEnam");
  if (slideEnam) slideEnam.classList.remove("d-none");
}

async function slideEmpatFlow() {
  const slideEmpat = qs("#slideEmpat");
  if (!slideEmpat) return;

  slideEmpat.classList.remove("d-none");
  const [btnGak, btnSuka] = qsa("button"); // sesuai urutan di HTML

  if (btnGak) {
    btnGak.addEventListener("click", () => {
      const rect = slideEmpat.getBoundingClientRect();
      slideEmpat.style.position = "fixed";
      const maxTop = Math.max(0, window.innerHeight - rect.height);
      const maxLeft = Math.max(0, window.innerWidth - rect.width);
      slideEmpat.style.top = `${Math.floor(Math.random() * (maxTop + 1))}px`;
      slideEmpat.style.left = `${Math.floor(Math.random() * (maxLeft + 1))}px`;
    });
  }

  await new Promise((resolve) => {
    if (btnSuka) {
      btnSuka.addEventListener(
        "click",
        async () => {
          slideEmpat.classList.remove("animate__delay-2s");
          slideEmpat.classList.replace("animate__fadeInDown", "animate__bounceOut");
          await sleep(900);
          slideEmpat.remove();
          await sleep(300);
          resolve();
        },
        { once: true }
      );
    } else {
      resolve();
    }
  });
}

async function slideLimaFlow() {
  const slideLima = qs("#slideLima");
  const trims = qs("#trims");
  if (!slideLima) return;

  slideLima.classList.remove("d-none");
  await sleep(400);
  if (trims) {
    trims.classList.remove("d-none");
    startTypeItTrims();
  }

  await new Promise((resolve) => {
    const onEnd = () => {
      slideLima.removeEventListener("animationend", onEnd);
      resolve();
    };
    slideLima.addEventListener("animationend", onEnd, { once: true });
  });

  slideLima.classList.add("animate__delay-3s");
  slideLima.classList.replace("animate__bounceIn", "animate__fadeOut");
  if (trims) {
    trims.classList.add("animate__animated", "animate__fadeOut", "animate__delay-3s");
  }
  await sleep(6300);
  if (trims) trims.remove();
  slideLima.remove();
}

// ================== Confetti (pakai jQuery $) ==================
("use strict");
var onlyOnKonami = false;

function confetti() {
  var $window = $(window),
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,
    PI = Math.PI,
    PI2 = PI * 2,
    timer = undefined,
    frame = undefined,
    confetti = [];

  var runFor = 2000;
  var isRunning = true;
  setTimeout(() => { isRunning = false; }, runFor);

  var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], pointer = 0;

  var particles = 150,
    spread = 20,
    sizeMin = 5,
    sizeMax = 12 - sizeMin,
    eccentricity = 10,
    deviation = 100,
    dxThetaMin = -0.1,
    dxThetaMax = -dxThetaMin - dxThetaMin,
    dyMin = 0.13,
    dyMax = 0.18,
    dThetaMin = 0.4,
    dThetaMax = 0.7 - dThetaMin;

  var colorThemes = [
    function () { return color((200 * random()) | 0, (200 * random()) | 0, (200 * random()) | 0); },
    function () { var black = (200 * random()) | 0; return color(200, black, black); },
    function () { var black = (200 * random()) | 0; return color(black, 200, black); },
    function () { var black = (200 * random()) | 0; return color(black, black, 200); },
    function () { return color(200, 100, (200 * random()) | 0); },
    function () { return color((200 * random()) | 0, 200, 200); },
    function () { var black = (256 * random()) | 0; return color(black, black, black); },
    function () { return colorThemes[random() < 0.5 ? 1 : 2](); },
    function () { return colorThemes[random() < 0.5 ? 3 : 5](); },
    function () { return colorThemes[random() < 0.5 ? 2 : 4](); },
  ];

  function color(r, g, b) { return "rgb(" + r + "," + g + "," + b + ")"; }
  function interpolation(a, b, t) { return ((1 - cos(PI * t)) / 2) * (b - a) + a; }

  var radius = 1 / eccentricity, radius2 = radius + radius;

  function createPoisson() {
    var domain = [radius, 1 - radius], measure = 1 - radius2, spline = [0, 1];
    while (measure) {
      var dart = measure * random(), i, l, interval, a, b, c, d;

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        (a = domain[i]), (b = domain[i + 1]), (interval = b - a);
        if (dart < measure + interval) { spline.push((dart += a - measure)); break; }
        measure += interval;
      }
      (c = dart - radius), (d = dart + radius);

      for (i = domain.length - 1; i > 0; i -= 2) {
        (l = i - 1), (a = domain[l]), (b = domain[i]);
        if (a >= c && a < d) { if (b > d) domain[l] = d; else domain.splice(l, 2); }
        else if (a < c && b > c) { if (b <= d) domain[i] = c; else domain.splice(i, 0, c, d); }
      }

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
        measure += domain[i + 1] - domain[i];
    }
    return spline.sort();
  }

  var container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "0";
  container.style.overflow = "visible";
  container.style.zIndex = "9999";

  function Confetto(theme) {
    this.frame = 0;
    this.outer = document.createElement("div");
    this.inner = document.createElement("div");
    this.outer.appendChild(this.inner);

    var outerStyle = this.outer.style, innerStyle = this.inner.style;
    outerStyle.position = "absolute";
    outerStyle.width = sizeMin + sizeMax * random() + "px";
    outerStyle.height = sizeMin + sizeMax * random() + "px";
    innerStyle.width = "100%";
    innerStyle.height = "100%";
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = "50px";
    outerStyle.transform = "rotate(" + 360 * random() + "deg)";
    this.axis = "rotate3D(" + cos(360 * random()) + "," + cos(360 * random()) + ",0,";
    this.theta = 360 * random();
    this.dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = this.axis + this.theta + "deg)";

    this.x = $(window).width() * random();
    this.y = -deviation;
    this.dx = sin(dxThetaMin + dxThetaMax * random());
    this.dy = dyMin + dyMax * random();
    outerStyle.left = this.x + "px";
    outerStyle.top = this.y + "px";

    this.splineX = createPoisson();
    this.splineY = [];
    for (var i = 1, l = this.splineX.length - 1; i < l; ++i) this.splineY[i] = deviation * random();
    this.splineY[0] = this.splineY[l] = deviation * random();

    this.update = function (height, delta) {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      var phi = (this.frame % 7777) / 7777, i = 0, j = 1;
      while (phi >= this.splineX[j]) i = j++;
      var rho = interpolation(this.splineY[i], this.splineY[j], (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i]));
      phi *= PI2;

      outerStyle.left = this.x + rho * cos(phi) + "px";
      outerStyle.top = this.y + rho * sin(phi) + "px";
      innerStyle.transform = this.axis + this.theta + "deg)";
      return this.y > height + deviation;
    };
  }

  function poof() {
    if (!frame) {
      document.body.appendChild(container);

      var theme = colorThemes[onlyOnKonami ? (colorThemes.length * random()) | 0 : 0], count = 0;

      (function addConfetto() {
        if (onlyOnKonami && ++count > particles) return (timer = undefined);
        var confetto = new Confetto(theme);
        confetti.push(confetto);
        container.appendChild(confetto.outer);
        timer = setTimeout(addConfetto, spread * random());
      })();

      var prev = undefined;
      requestAnimationFrame(function loop(timestamp) {
        var delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        var height = $(window).height();

        for (var i = confetti.length - 1; i >= 0; --i) {
          if (confetti[i].update(height, delta)) {
            container.removeChild(confetti[i].outer);
            confetti.splice(i, 1);
          }
        }

        if (timer || confetti.length) return (frame = requestAnimationFrame(loop));
        document.body.removeChild(container);
        frame = undefined;
      });
    }
  }

  $(window).keydown(function (event) {
    pointer = konami[pointer] === event.which ? pointer + 1 : +(event.which === konami[0]);
    if (pointer === konami.length) { pointer = 0; poof(); }
  });

  if (!onlyOnKonami) poof();
}

// ================== Boot ==================
window.addEventListener("DOMContentLoaded", () => {
  const nameEl = qs("#name");
  if (nameEl) nameEl.textContent = "Dedew";

  // Countdown selesai pada 22 Agustus 2025 23:59:59 WIB
  startCountdown(
    { targetISO: "2025-08-22T23:59:59", tz: "Asia/Jakarta" },
    async () => {
      // Slide 1 tampil dulu
      const slideSatu = qs("#slideSatu");
      const timer = qs("#timer");
      if (timer) timer.classList.add("d-none");
      if (slideSatu) slideSatu.classList.remove("d-none");

      // BOOM efek saat slide 1 muncul
      boomAndPaper();

      // tunggu beberapa detik sebelum memunculkan tombol mulai
      await sleep(3000);
      showTap("Ketuk untuk memulai");

      // Ketukan pertama → mulai musik & flow
      const onFirstClick = async () => {
        document.body.removeEventListener("click", onFirstClick);
        hideTap();
        await playOnFirstInteraction(); // 🎵 mulai musik
        try { if (typeof confetti === "function") confetti(); } catch(e){}
        startFlowAfterFirstTap();       // lanjut ke slide 2, dst
      };
      document.body.addEventListener("click", onFirstClick, { once: true });
    }
  );
});
