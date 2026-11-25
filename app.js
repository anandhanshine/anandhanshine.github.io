/* ============================================================
   app.js — 3D shapes, disc stack loop, project files, background
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, "0");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     SFX — tiny synthesised UI sounds (no audio files, no deps)
     ------------------------------------------------------------ */
  const sfx = (function () {
    const KEY = "as_sfx";
    let ctx = null;
    let master = null;
    let enabled = true;
    let unlocked = false;
    let lastHoverAt = 0;
    try { enabled = localStorage.getItem(KEY) !== "off"; } catch (e) {}

    function ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.4;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    function tone(o) {
      if (!enabled || !unlocked) return;
      const c = ensure();
      if (!c || !master) return;
      const t0 = c.currentTime + (o.delay || 0);
      const dur = o.dur || 0.12;
      const peak = Math.max(0.0002, o.gain == null ? 0.06 : o.gain);
      const osc = c.createOscillator();
      const amp = c.createGain();
      osc.type = o.type || "sine";
      osc.frequency.setValueAtTime(o.freq, t0);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(24, o.to), t0 + dur);
      amp.gain.setValueAtTime(0.0001, t0);
      amp.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(amp);
      amp.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }

    return {
      get enabled() { return enabled; },
      unlock: function () {
        unlocked = true;
        if (enabled) ensure();
      },
      toggle: function () {
        const next = !enabled;
        if (!next) tone({ freq: 220, to: 110, dur: 0.12, gain: 0.05, type: "sine" });
        enabled = next;
        try { localStorage.setItem(KEY, enabled ? "on" : "off"); } catch (e) {}
        if (next) tone({ freq: 440, to: 660, dur: 0.1, gain: 0.05, type: "sine" });
        return enabled;
      },
      hover: function () {
        const now = performance.now();
        if (now - lastHoverAt < 60) return;
        lastHoverAt = now;
        tone({ freq: 880, to: 660, dur: 0.08, gain: 0.025, type: "sine" });
      },
      press: function () {
        tone({ freq: 660, to: 440, dur: 0.09, gain: 0.04, type: "sine" });
      },
      swap: function () {
        tone({ freq: 440, to: 550, dur: 0.1, gain: 0.035, type: "sine" });
      },
      open: function () {
        tone({ freq: 330, to: 660, dur: 0.18, gain: 0.05, type: "sine" });
      },
      close: function () { tone({ freq: 550, to: 330, dur: 0.16, gain: 0.045, type: "sine" }); },
      blip: function () { tone({ freq: 770, to: 660, dur: 0.07, gain: 0.03, type: "sine" }); }
    };
  })();

  /* ------------------------------------------------------------
     Project data (edit here to re-theme the whole archive)
     ------------------------------------------------------------ */
  const PROJECTS = [
    {
      title: "Squishy",
      engine: "Unity",
      status: "Playable build",
      genre: "Arcade / Hyper-casual",
      role: "Gameplay Programmer & Character Designer",
      poster: "assets/img/poster-01.svg",
      tags: ["Unity", "C#", "Hyper-casual", "Character Design", "Game Feel", "Gameplay"],
      blurb: "A one-thumb arcade game about squashing, stretching and flinging a blob through hazard-packed levels. I built the squish-and-launch physics and the juice layer that makes every bounce readable — and designed the blob character itself, from silhouette to expressions.",
      demo: "",
      video: "assets/video/squishy-demo.mp4",
      dialogue: [
        { name: "Design lead", text: "One thumb. Three seconds to understand it. If the squish doesn't read on a bus, it doesn't work." },
        { name: "Squishy", text: "*squish*" },
        { name: "Art note", text: "The blob started as a circle with two dots. Everything after that was squash, stretch and a lot of deleted mouths." },
        { name: "Design lead", text: "That's the whole pitch. Build it." }
      ]
    },
    {
      title: "Project 02",
      engine: "Unreleased prototype",
      status: "In progress",
      genre: "Prototype",
      poster: "assets/img/poster-02.svg",
      tags: ["Prototype", "Unreleased"],
      blurb: "An unreleased prototype in progress. Once it has a name, a capture and something worth showing, this file gets filled in.",
      demo: "",
      dialogue: []
    },
    {
      title: "Project 03",
      engine: "Unreleased prototype",
      status: "In progress",
      genre: "Prototype",
      poster: "assets/img/poster-03.svg",
      tags: ["Prototype", "Unreleased"],
      blurb: "An unreleased prototype in progress. Once it has a name, a capture and something worth showing, this file gets filled in.",
      demo: "",
      dialogue: []
    },
    {
      title: "Project 04",
      engine: "Unreleased prototype",
      status: "In progress",
      genre: "Prototype",
      poster: "assets/img/poster-04.svg",
      tags: ["Prototype", "Unreleased"],
      blurb: "An unreleased prototype in progress. Once it has a name, a capture and something worth showing, this file gets filled in.",
      demo: "",
      dialogue: []
    },
    {
      title: "Project 05",
      engine: "Unreleased prototype",
      status: "In progress",
      genre: "Prototype",
      poster: "assets/img/poster-05.svg",
      tags: ["Prototype", "Unreleased"],
      blurb: "An unreleased prototype in progress. Once it has a name, a capture and something worth showing, this file gets filled in.",
      demo: "",
      dialogue: []
    },
    {
      title: "Project 06",
      engine: "Unreleased prototype",
      status: "In progress",
      genre: "Prototype",
      poster: "assets/img/poster-06.svg",
      tags: ["Prototype", "Unreleased"],
      blurb: "An unreleased prototype in progress. Once it has a name, a capture and something worth showing, this file gets filled in.",
      demo: "",
      dialogue: []
    }
  ];

  const N = PROJECTS.length;

  /* ------------------------------------------------------------
     3D extruded shapes
     ------------------------------------------------------------ */
  const NS = "http://www.w3.org/2000/svg";

  function svg(viewBox, inner) {
    return '<svg viewBox="' + viewBox + '" xmlns="' + NS + '" aria-hidden="true">' + inner + "</svg>";
  }

  // Gamepad with a real control layout: shoulder bumpers, left stick (top-left),
  // D-pad (bottom-left), A/B/X/Y diamond (top-right), right stick (bottom-right),
  // select / start / home in the middle. Parts carry .pb-* classes so the boot
  // loader can light them up one by one. `gid` keeps gradient ids unique per copy.
  function padArt(gid) {
    const FONT = 'font-family="Chakra Petch,Arial,sans-serif" font-weight="700" font-size="7.5" text-anchor="middle" fill="#0f1115"';
    function face(cls, cx, cy, color, letter) {
      return '<g class="pb ' + cls + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="6.8" fill="' + color + '" stroke="#1a1e24" stroke-width="1.5"/>' +
        '<text x="' + cx + '" y="' + (cy + 2.7) + '" ' + FONT + '>' + letter + '</text></g>';
    }
    function stick(cls, cx, cy) {
      return '<g class="pb ' + cls + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#1a1e24" opacity=".7"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="8.5" fill="#0f1115" stroke="#3ff0dc" stroke-width="1" stroke-opacity=".55"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#3ff0dc" opacity=".35"/></g>';
    }
    return svg("0 0 200 140",
      "<defs>" +
        '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#3ff0dc"/><stop offset=".55" stop-color="#2a8f86"/><stop offset="1" stop-color="#4f7a12"/>' +
        "</linearGradient>" +
      "</defs>" +
      // shoulder bumpers (sit behind the body)
      '<rect class="pb pb-lb" x="32" y="14" width="46" height="16" rx="8" fill="#b4f24a" stroke="#1a1e24" stroke-width="3"/>' +
      '<rect class="pb pb-rb" x="122" y="14" width="46" height="16" rx="8" fill="#b4f24a" stroke="#1a1e24" stroke-width="3"/>' +
      // body with two grips
      '<path class="pad-body" d="M58 28H142C160 28 172 34 180 52C189 74 196 104 188 120C182 132 166 134 156 122C148 112 142 100 132 96H68C58 100 52 112 44 122C34 134 18 132 12 120C4 104 11 74 20 52C28 34 40 28 58 28Z" ' +
        'fill="url(#' + gid + ')" stroke="#1a1e24" stroke-width="4" stroke-linejoin="round"/>' +
      // sticks: left upper, right lower
      stick("pb-ls", 54, 52) +
      stick("pb-rs", 128, 80) +
      // D-pad cross, lower left
      '<g class="pb pb-dpad">' +
        '<path d="M68 68h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#0f1115" stroke="#1a1e24" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<circle cx="72" cy="80" r="2.4" fill="#3ff0dc" opacity=".5"/>' +
      "</g>" +
      // face buttons, upper right (Y top, X left, B right, A bottom)
      face("pb-y", 146, 40, "#b4f24a", "Y") +
      face("pb-x", 134, 52, "#3ff0dc", "X") +
      face("pb-b", 158, 52, "#b4f24a", "B") +
      face("pb-a", 146, 64, "#3ff0dc", "A") +
      // select / start / home
      '<rect class="pb pb-sel" x="84" y="54" width="10" height="5" rx="2.5" fill="#0f1115" opacity=".75"/>' +
      '<rect class="pb pb-start" x="106" y="54" width="10" height="5" rx="2.5" fill="#0f1115" opacity=".75"/>' +
      '<g class="pb pb-home"><circle cx="100" cy="40" r="6" fill="#0f1115" opacity=".8"/>' +
        '<circle cx="100" cy="40" r="2.6" fill="#3ff0dc"/></g>'
    );
  }

  const ART = {
    // the archive ring is the only disc motif we keep — given a machined
    // inner bevel so the extruded slices read as one solid object
    ring: svg("0 0 100 100",
      '<defs><linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#3ff0dc"/><stop offset="1" stop-color="#b4f24a"/>' +
      "</linearGradient></defs>" +
      '<path d="M50 4a46 46 0 1 0 .1 0zM50 26a24 24 0 1 1-.1 0z" fill="url(#ringG)" fill-rule="evenodd"/>' +
      '<circle cx="50" cy="50" r="35" fill="none" stroke="#0f1115" stroke-width="1.6" opacity=".45"/>' +
      '<circle cx="50" cy="50" r="45" fill="none" stroke="#bff8ef" stroke-width="1" opacity=".35"/>'
    )
  };

  function buildFlat(host, art, layers, depth) {
    const wrap = document.createElement("div");
    wrap.className = "x3d";
    host.appendChild(wrap);
    const mid = (layers - 1) / 2;
    for (let i = 0; i < layers; i++) {
      const l = document.createElement("div");
      l.className = "layer";
      l.dataset.z = String(i);
      l.style.transform = "translateZ(" + ((i - mid) * depth) + "px)";
      // a rounded bevel: silhouette tucks in through the middle slices,
      // while the two flat faces sit proud and bright
      const edge = Math.abs(i - mid) / (mid + 1);
      l.style.scale = (1 - (1 - edge) * 0.055).toFixed(3);
      l.style.filter = "brightness(" + (0.62 + edge * 0.38).toFixed(3) + ")";
      l.innerHTML = art;
      wrap.appendChild(l);
    }
  }

  function buildCube(host, pips) {
    const wrap = document.createElement("div");
    wrap.className = "x3d";
    wrap.dataset.cube = "1";
    host.appendChild(wrap);

    // six real die faces with opposing pairs (1/6, 2/5, 3/4).
    // --burst / --unfold are written by the scroll loop: the die petals
    // open out as About arrives, then fold back into a solid cube.
    const Z = "translateZ(calc(var(--half) + var(--burst, 0px)))";
    const faces = [
      [Z + " rotateX(calc(var(--unfold, 0) * -16deg))", 1],
      ["rotateY(180deg) " + Z + " rotateX(calc(var(--unfold, 0) * 16deg))", 6],
      ["rotateY(90deg) " + Z + " rotateY(calc(var(--unfold, 0) * 16deg))", 2],
      ["rotateY(-90deg) " + Z + " rotateY(calc(var(--unfold, 0) * -16deg))", 5],
      ["rotateX(90deg) " + Z + " rotateX(calc(var(--unfold, 0) * 16deg))", 3],
      ["rotateX(-90deg) " + Z + " rotateX(calc(var(--unfold, 0) * -16deg))", 4]
    ];
    faces.forEach(function (f) {
      const d = document.createElement("div");
      d.className = "cube-face layer face-" + f[1] + (pips ? " pips pips-" + f[1] : "");
      d.style.transform = f[0];
      wrap.appendChild(d);
    });
  }

  function syncShapeSize(host) {
    const w = host.clientWidth || 120;
    const h = host.clientHeight || w;
    const side = Math.min(w, h);
    host.style.setProperty("--half", (side / 2) + "px");
    host.style.setProperty("--depth", (side * 0.05) + "px");

    // a cube must live in a square box, even inside a wide card
    const cube = host.querySelector(".x3d[data-cube]");
    if (cube) {
      cube.style.width = side + "px";
      cube.style.height = side + "px";
      cube.style.left = "50%";
      cube.style.top = "50%";
      cube.style.right = "auto";
      cube.style.bottom = "auto";
      cube.style.transform = "translate(-50%,-50%)";
    }

    // re-centre the extruded stack around z = 0 so it spins in place
    const depth = Math.max(0.8, side * 0.012);
    const layers = host.querySelectorAll(".x3d > .layer[data-z]");
    const mid = (layers.length - 1) / 2;
    layers.forEach(function (l) {
      l.style.transform = "translateZ(" + ((Number(l.dataset.z) - mid) * depth).toFixed(2) + "px)";
    });
  }

  const shapeSyncs = [];

  function initShapes() {
    $$("[data-shape]").forEach(function (host) {
      if (host.dataset.built) return;
      host.dataset.built = "1";
      const kind = host.dataset.shape;
      const speed = parseFloat(host.dataset.speed || "16");
      host.style.animationDuration = speed + "s";

      if (kind === "cube" || kind === "dice") {
        buildCube(host, kind === "dice");
      } else if (kind === "ring") {
        host.innerHTML = "";
        buildFlat(host, ART.ring, 26, 1.4);
      }
      shapeSyncs.push(function () { syncShapeSize(host); });
    });
    shapeSyncs.forEach(function (fn) { fn(); });
  }

  /* ------------------------------------------------------------
     Scroll-driven 3D — CSS transforms only, no libraries
     The page already has real 3D objects; this section gives them
     scroll-linked behaviour and builds the About desk, which
     assembles itself out of boxes as the section arrives.
     ------------------------------------------------------------ */
  const smoothstep = function (a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function viewProgress(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }

  /* ---- the About scene: a desk that assembles itself from voxel boxes ---- */
  const VOX = {
    body: ["#242931", "#171a1f", "#2e353f"],
    dark: ["#1b1f25", "#101216", "#242931"],
    lime: ["#4f7a12", "#33500c", "#b4f24a"],
    aqua: ["#16b3a4", "#0e7a70", "#3ff0dc"],
    silver: ["#c8d0dc", "#929cab", "#e4eaf2"],
    glow: ["#3ff0dc", "#16b3a4", "#9ff8ee"]
  };

  function vox(x, y, z, w, h, d, tone, glow) {
    const el = document.createElement("div");
    el.className = "vox" + (glow ? " is-glow" : "");
    const c = VOX[tone] || VOX.body;
    el.style.cssText =
      "--w:" + w + "px;--h:" + h + "px;--d:" + d + "px;" +
      "--cf:" + c[0] + ";--cs:" + c[1] + ";--ct:" + c[2] + ";" +
      "transform:translate3d(" + x + "px," + y + "px," + z + "px)";
    el.innerHTML =
      '<i class="f f-f"></i><i class="f f-b"></i><i class="f f-l"></i>' +
      '<i class="f f-r"></i><i class="f f-t"></i><i class="f f-u"></i>';
    return el;
  }

  function deskPart(rig, cfg) {
    const el = document.createElement("div");
    el.className = "desk-part";
    const joint = document.createElement("div");
    joint.className = "desk-joint";
    cfg.voxels.forEach(function (v) { joint.appendChild(v); });
    if (cfg.build) cfg.build(joint);
    el.appendChild(joint);
    rig.appendChild(el);
    return { el: el, joint: joint, off: cfg.off, rot: cfg.rot, at: cfg.at, dur: cfg.dur };
  }

  let deskParts = null;
  let deskRigEl = null;
  let deskShadowEl = null;

  function buildDesk() {
    const rig = $("#deskRig");
    if (!rig || deskParts) return;
    deskParts = [];
    deskRigEl = rig;
    deskShadowEl = $(".desk-shadow");

    // the table lands first: top slab with a lit front edge
    deskParts.push(deskPart(rig, {
      at: 0.04, dur: 0.08,
      off: [0, 94, -58], rot: [-30, 0, 8],
      voxels: [
        vox(0, 0, 0, 252, 12, 134, "body"),
        vox(0, 7, 67, 252, 3, 3, "aqua", true)
      ]
    }));

    // four legs, each flying in from a different corner
    [
      { x: -104, z: 48, off: [-84, 96, 74], rot: [0, -32, -14] },
      { x: 104, z: 48, off: [84, 96, 68], rot: [0, 32, 14] },
      { x: -104, z: -48, off: [-90, -28, -72], rot: [0, 38, 12] },
      { x: 104, z: -48, off: [90, -34, -78], rot: [0, -38, -12] }
    ].forEach(function (l, i) {
      deskParts.push(deskPart(rig, {
        at: 0.09 + i * 0.008, dur: 0.06,
        off: l.off, rot: l.rot,
        voxels: [
          vox(l.x, 39, l.z, 10, 66, 10, "body"),
          vox(l.x, 74, l.z, 16, 4, 16, "silver")
        ]
      }));
    });

    // monitor: base, neck, screen shell, power dot, glowing screen
    deskParts.push(deskPart(rig, {
      at: 0.16, dur: 0.07,
      off: [0, -94, 42], rot: [-24, -28, 4],
      voxels: [
        vox(0, -8.5, -30, 76, 5, 30, "silver"),
        vox(0, -23, -30, 12, 24, 10, "body"),
        vox(0, -68, -30, 140, 66, 12, "body"),
        vox(52, -38, -23.5, 3, 2, 1, "aqua", true)
      ],
      build: function (joint) {
        const scr = document.createElement("div");
        scr.className = "desk-screen";
        joint.appendChild(scr);
      }
    }));

    // keyboard: body, inset plate, three key rows, lime spacebar
    deskParts.push(deskPart(rig, {
      at: 0.23, dur: 0.07,
      off: [22, 64, 94], rot: [28, 16, -10],
      voxels: [
        vox(0, -10, 26, 118, 8, 38, "body"),
        vox(0, -14.5, 26, 104, 2, 28, "dark"),
        vox(0, -16.25, 33, 96, 1.5, 3.5, "silver"),
        vox(0, -16.25, 28, 96, 1.5, 3.5, "silver"),
        vox(0, -16.25, 23, 96, 1.5, 3.5, "silver"),
        vox(0, -16.25, 17.5, 40, 1.5, 4, "lime")
      ]
    }));

    // mouse: body, split line, aqua scroll wheel
    deskParts.push(deskPart(rig, {
      at: 0.28, dur: 0.06,
      off: [80, 48, 70], rot: [16, 44, 22],
      voxels: [
        vox(86, -11, 30, 24, 10, 32, "body"),
        vox(86, -16.2, 30, 1, 1, 18, "dark"),
        vox(86, -16.9, 37, 4, 2.5, 7, "aqua", true)
      ]
    }));

    // CPU tower: shell, aqua light strip, power button, lime top vent
    deskParts.push(deskPart(rig, {
      at: 0.33, dur: 0.07,
      off: [-100, 22, 80], rot: [0, -44, -16],
      voxels: [
        vox(-92, -34, -6, 40, 56, 36, "body"),
        vox(-99, -34, 12.2, 3, 26, 1, "aqua", true),
        vox(-84, -54, 12.2, 6, 2, 1, "silver"),
        vox(-92, -63, -6, 30, 2, 26, "lime")
      ]
    }));
  }

  function updateDesk(p, scrollY) {
    if (!deskParts) return;

    deskParts.forEach(function (part) {
      const t = smoothstep(part.at, part.at + part.dur, p);
      const k = 1 - t;
      part.el.style.transform =
        "translate3d(" + (part.off[0] * k).toFixed(2) + "px," +
        (part.off[1] * k).toFixed(2) + "px," + (part.off[2] * k).toFixed(2) + "px) " +
        "rotateX(" + (part.rot[0] * k).toFixed(2) + "deg) " +
        "rotateY(" + (part.rot[1] * k).toFixed(2) + "deg) " +
        "rotateZ(" + (part.rot[2] * k).toFixed(2) + "deg)";
    });

    // the screen powers on once everything is seated
    const on = smoothstep(0.40, 0.50, p);
    const rig = deskRigEl;
    if (rig) {
      rig.style.setProperty("--on", on.toFixed(2));
      const turn = (p - 0.5) * 34;
      rig.style.transform =
        "rotateX(-6deg) rotateY(" +
        (turn + Math.sin(scrollY * 0.006) * 3 * on).toFixed(2) + "deg)";
    }
    const shadow = deskShadowEl;
    if (shadow) shadow.style.opacity = (0.26 + on * 0.5).toFixed(2);
  }

  let scroll3dRaf = 0;

  function initScroll3D() {
    buildDesk();
    if (reduceMotion) return;
    document.documentElement.classList.add("js3d");

    const spins = $$(".spin[data-shape]").map(function (el, i) {
      return {
        el: el,
        phase: (i * 47) % 360,
        host: el.closest(".shape") || el.closest(".cap") || el
      };
    });
    const aboutArt = $(".about-art");
    const shelf = $("#stack");
    const die = $(".s-dice");
    const capCards = $$(".cap-grid .cap.reveal");

    // a small set of purposeful depth layers — section titles, the shelf and
    // the two surviving decorative objects. Positive travel lags, negative leads.
    const parLayers = [];
    const par = function (el, travel) {
      if (el) parLayers.push({ el: el, travel: travel });
    };
    par($(".work .s-mini"), 44);
    par($(".about .s-dice"), -46);
    par($(".work .sec-head"), 26);
    par($(".caps .sec-head"), -28);
    par($(".about .about-art"), 34);
    par(shelf, -18);
    const heroCopy = $(".hero-copy");
    const scrollCue = $(".scroll-cue");

    // the four craft cards arrive in sequence rather than all at once
    capCards.forEach(function (el, i) { el.style.transitionDelay = (i * 85) + "ms"; });

    const frame = function () {
      scroll3dRaf = 0;
      const vh = window.innerHeight || 800;

      // every extruded shape revolves around its own axis as it travels
      // (read every rect first, then write, to avoid layout thrash)
      const revolve = [];
      spins.forEach(function (s) {
        const r = s.host.getBoundingClientRect();
        if (r.bottom < -vh * 0.4 || r.top > vh * 1.4) return;
        revolve.push({ s: s, p: clamp((vh - r.top) / (vh + r.height), 0, 1) });
      });
      revolve.forEach(function (item) {
        const s = item.s;
        const q = item.p * 2 - 1;
        s.el.style.transform =
          "rotateY(" + (q * 132 + s.phase).toFixed(2) + "deg) " +
          "rotateX(" + (q * 10).toFixed(2) + "deg)" +
          (s.el.dataset.shape === "dice" ? " rotateZ(var(--die-turn,0deg))" : "");
      });

      // decorative depth layers — read every rect first, then write
      const drift = [];
      parLayers.forEach(function (l) {
        const r = l.el.getBoundingClientRect();
        if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) return;
        drift.push({
          el: l.el,
          y: (clamp((vh - r.top) / (vh + r.height), 0, 1) - 0.5) * l.travel
        });
      });
      drift.forEach(function (d) {
        d.el.style.translate = "0px " + d.y.toFixed(1) + "px";
      });

      // the hero only exists at the top, so drive it straight from scrollY:
      // the copy lags and the scroll cue leads, both starting at zero
      const heroScroll = clamp(window.scrollY, 0, vh);
      if (heroCopy) heroCopy.style.translate = "0px " + (heroScroll * 0.07).toFixed(1) + "px";
      if (scrollCue) scrollCue.style.translate = "0px " + (-heroScroll * 0.12).toFixed(1) + "px";

      // the archive shelf tilts up into place like a cabinet being lowered
      if (shelf) {
        const sr = shelf.getBoundingClientRect();
        const sp = clamp((vh - sr.top) / (vh + sr.height), 0, 1);
        const seated = smoothstep(0.14, 0.54, sp);
        shelf.style.setProperty("--shelf-rx", ((1 - seated) * 12).toFixed(2) + "deg");
        shelf.style.setProperty("--shelf-z", ((-70) * (1 - seated)).toFixed(1) + "px");
      }

      // craft cards flip in one after another instead of arriving flat
      capCards.forEach(function (el, i) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        const t = smoothstep(0.12 + i * 0.05, 0.48 + i * 0.05, p);
        el.style.setProperty("--cap-ry", ((-28 + i * 3) * (1 - t)).toFixed(2) + "deg");
        el.style.setProperty("--cap-z", (-70 * (1 - t)).toFixed(1) + "px");
      });

      // the die opens out into six petals as About arrives, then folds
      // itself back into a solid cube as it leaves — CSS transforms only
      if (die) {
        const dr = die.getBoundingClientRect();
        const p = clamp((vh - dr.top) / (vh + dr.height), 0, 1);
        const open = Math.sin(p * Math.PI);
        die.style.setProperty("--burst", (open * 46).toFixed(1) + "px");
        die.style.setProperty("--unfold", open.toFixed(3));
        die.style.setProperty("--die-turn", (open * 24).toFixed(1) + "deg");
      }

      if (aboutArt) updateDesk(viewProgress(aboutArt), window.scrollY);
    };

    const request = function () {
      if (!scroll3dRaf) scroll3dRaf = requestAnimationFrame(frame);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    frame();                      // place the rig on the very first paint
    setTimeout(request, 700);
    setTimeout(request, 1800);
  }

  /* ------------------------------------------------------------
     Game-case shelf (projects)
     Cases stand spine-out on a shelf. Hover pulls one forward, click opens
     it: the disc with its poster on one side, the project file on the other.
     Pure CSS 3D, no library.
     ------------------------------------------------------------ */
  const stack = $("#stack");
  const stage = $("#stage");
  const NB = 8;                     // empty slots on each side of the real cases
  const cases = [];                 // real cases, index = project index
  const slots = [];                 // every slot on the shelf, left to right
  let hov = -1;                     // case pulled out by the pointer / keyboard / idle loop
  let sel = -1;                     // case that is open
  let active = 0;
  let hovered = false;
  let userTouchedAt = 0;
  let lastPointerType = "mouse";
  const pointerPos = { x: -9999, y: -9999 };
  let lastSwitch = { x: -9999, y: -9999 };
  let dim = { cw: 360, ch: 504, cd: 58, narrow: false };
  let swapTimer = null;

  const TINTS = [["#16b3a4", "#1f232a"], ["#4f7a12", "#20241a"], ["#3ff0dc", "#232830"],
                 ["#b4f24a", "#262b1f"], ["#16b3a4", "#1d2129"], ["#4f7a12", "#21262e"]];

  function wrap(x) {
    let d = ((x % N) + N) % N;
    if (d > N / 2) d -= N;
    return d;
  }

  // case size is computed here and handed to the CSS as custom properties
  function measure() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const narrow = vw < 760;
    let cw = narrow ? Math.min(vw * 0.74, vh * 0.42, 340) : Math.min(vw * 0.34, vh * 0.52, 440);
    cw = Math.max(210, cw);
    dim = { cw: cw, ch: cw * 1.4, cd: cw * 0.16, narrow: narrow };
    stack.style.setProperty("--cw", cw + "px");
    stack.style.setProperty("--ch", dim.ch + "px");
    stack.style.setProperty("--cd", dim.cd + "px");
    stack.style.height = Math.round(dim.ch + (narrow ? 130 : 96)) + "px";
  }

  function caseHTML(p, i) {
    const art = "background-image:url('" + p.poster + "')";
    const num = pad(i + 1);
    return '<div class="case-body">' +
      '<div class="f f-back"></div><div class="f f-top"></div><div class="f f-bottom"></div><div class="f f-edge"></div>' +
      '<div class="f f-tray">' +
        '<span class="cdisc"><span class="cdisc-art" style="' + art + '"></span><span class="cdisc-rings"></span>' +
        '<span class="cdisc-shine"></span><span class="cdisc-hub"></span></span>' +
        '<span class="tray-label"><b>' + num + '</b><i></i>' + p.title + "</span>" +
      "</div>" +
      '<div class="f f-spine">' +
        '<b class="spine-num">' + num + "</b>" +
        '<span class="spine-title">' + p.title + "</span>" +
        '<span class="spine-pellets" aria-hidden="true"><i></i><i></i><i></i></span>' +
      "</div>" +
      '<div class="cover">' +
        '<div class="cover-front" style="' + art + '">' +
          '<span class="cover-top"><b>' + num + "</b><span>" + (p.engine || "Prototype") + "</span></span>" +
          '<span class="cover-title"><i></i><b>' + p.title + "</b><small>" + p.genre + "</small></span>" +
        "</div>" +
        '<div class="cover-back"></div>' +
      "</div>" +
    "</div>";
  }

  function buildShelf() {
    if (!stack || !stage) return;
    stage.innerHTML = "";
    cases.length = 0;
    slots.length = 0;
    if (!$(".board", stack)) {
      const board = document.createElement("div");
      board.className = "board";
      stack.insertBefore(board, stage);
    }
    const M = N + NB * 2;
    for (let j = 0; j < M; j++) {
      const i = j - NB;
      if (i < 0 || i >= N) {
        const b = document.createElement("div");
        b.className = "blank";
        b.setAttribute("aria-hidden", "true");
        stage.appendChild(b);
        slots.push({ el: b, i: -1, j: j });
        continue;
      }
      const p = PROJECTS[i];
      const el = document.createElement("div");
      el.className = "case";
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.dataset.i = String(i);
      el.setAttribute("aria-label", pad(i + 1) + " — " + p.title + ": open the case");
      el.style.setProperty("--c1", TINTS[i % TINTS.length][0]);
      el.style.setProperty("--c2", TINTS[i % TINTS.length][1]);
      el.innerHTML = caseHTML(p, i);
      el._body = el.firstChild;

      el.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch" || sel >= 0) return;
        hovered = true;
        sfx.hover();
        if (hov === i) return;
        // only switch when the pointer really moved — otherwise a case sliding
        // under a resting cursor would keep stealing the hover
        const moved = Math.hypot(pointerPos.x - lastSwitch.x, pointerPos.y - lastSwitch.y);
        if (hov >= 0 && moved < 14) return;
        lastSwitch = { x: pointerPos.x, y: pointerPos.y };
        hov = i; active = i;
        userTouchedAt = performance.now();
        sfx.swap();
        layout();
      });
      el.addEventListener("focus", function () {
        if (sel >= 0) return;
        hov = i; active = i;
        layout();
      });
      el.addEventListener("click", function (e) {
        if (e.target.closest(".case-panel")) return;
        if (sel >= 0) { if (sel !== i) swapTo(i); return; }
        userTouchedAt = performance.now();
        // touch: first tap pulls the case out, second tap opens it
        if (lastPointerType === "touch" && hov !== i) { hov = i; active = i; sfx.swap(); layout(); return; }
        openCase(i);
      });

      stage.appendChild(el);
      cases[i] = el;
      slots.push({ el: el, i: i, j: j });
    }
    const all = $("#counterAll");
    if (all) all.textContent = pad(N);
  }

  /* ---------- the project file printed on the inside of the open cover ---------- */
  function panelHTML(p, i) {
    const rows = [
      ["STATUS", p.status], ["ENGINE", p.engine], ["GENRE", p.genre], ["PLATFORM", p.platform],
      ["ROLE", p.role], ["TEAM", p.team && p.duration ? p.team + " · " + p.duration : p.team], ["YEAR", p.year]
    ].filter(function (r) { return r[1]; })
     .map(function (r) { return "<div><b>" + r[0] + "</b> <span>" + r[1] + "</span></div>"; }).join("");
    const note = p.video ? "demo video — gameplay capture" : (p.youtube ? "demo video — in-engine capture" : "capture coming soon");
    const href = p.demo || "";
    const hasDemo = href && !/example\.com/i.test(href);
    return '<div class="case-panel">' +
      '<div class="cp-top"><span class="file-tag"><i></i> PROJECT FILE // <b>' + pad(i + 1) + "</b></span>" +
        '<span class="cp-btns"><button class="nav-btn view-toggle" type="button" data-case-view>Disc &#9656;</button>' +
        '<button class="icon-btn" type="button" data-case-close aria-label="Close project file">&#10005;</button></span></div>' +
      '<div class="m-media"><div class="video-shell"></div><p class="media-note">' + note + "</p></div>" +
      '<div class="m-info"><p class="m-engine">' + (p.engine || "Unreleased prototype") + "</p><h3>" + p.title + "</h3>" +
        '<div class="syslog">' + rows + "</div>" +
        (hasDemo ? '<div class="m-actions"><a class="btn btn-aqua" href="' + href + '" target="_blank" rel="noopener">&#9654;  Play demo</a></div>' : "") +
      "</div></div>";
  }

  function loadVideo(shell, p, i) {
    if (!p || !shell) return;
    const idx = typeof i === "number" ? i : PROJECTS.indexOf(p);
    // project 01 has a local fallback capture; empty slots stay empty
    let src = p.video || (idx === 0 ? "assets/demos/1.mp4" : "");
    shell.innerHTML = "";
    if (src) {
      const vid = document.createElement("video");
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = "auto";
      vid.addEventListener("error", function () {
        shell.innerHTML = '<div class="video-empty">capture coming soon</div>';
      }, { once: true });
      vid.src = src;
      shell.appendChild(vid);
      vid.load();
      return;
    }
    if (!p.youtube) {
      shell.innerHTML = '<div class="video-empty">' + (p.status ? "capture coming soon" : "demo capture unavailable") + "</div>";
      return;
    }
    shell.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + p.youtube + '?rel=0&modestbranding=1" ' +
      'title="' + p.title + ' demo video" loading="lazy" ' +
      'allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  }

  function fillPanel(i) {
    const host = $(".cover-back", cases[i]);
    host.innerHTML = panelHTML(PROJECTS[i], i);
    const panel = host.firstChild;
    $("[data-case-close]", panel).addEventListener("click", function (e) { e.stopPropagation(); closeCase(); });
    const vt = $("[data-case-view]", panel);
    vt.addEventListener("click", function (e) {
      e.stopPropagation();
      const on = cases[i].classList.toggle("view-disc");
      vt.innerHTML = on ? "&#9666; Info" : "Disc &#9656;";
      sfx.swap();
      layout();
    });
    loadVideo($(".video-shell", panel), PROJECTS[i], i);
  }

  function openCase(i) {
    if (sel === i) return;
    clearTimeout(swapTimer);
    sel = i; active = i; hov = i;
    cases.forEach(function (c, k) { c.classList.toggle("is-open", k === i); c.classList.remove("view-disc"); });
    document.documentElement.classList.add("case-open");
    fillPanel(i);
    sfx.open();
    layout();
    const cb = $("[data-case-close]", cases[i]);
    if (cb) setTimeout(function () { try { cb.focus({ preventScroll: true }); } catch (e) {} }, 700);
  }

  function closeCase(silent) {
    if (sel < 0) return;
    const el = cases[sel];
    const media = $("video, iframe", el);
    if (media && media.pause) { try { media.pause(); } catch (e) {} }
    el.classList.remove("is-open", "view-disc");
    document.documentElement.classList.remove("case-open");
    sel = -1;
    hov = hovered ? hov : -1;
    if (!silent) sfx.close();
    layout();
    setTimeout(function () {
      if (!el.classList.contains("is-open")) { const back = $(".cover-back", el); if (back) back.innerHTML = ""; }
    }, 1000);
  }

  function swapTo(i) {
    closeCase(true);
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () { openCase(i); }, 560);
  }

  function step(d) {
    userTouchedAt = performance.now();
    if (sel >= 0) { swapTo((sel + d + N) % N); return; }
    active = ((active + d) % N + N) % N;
    hov = active;
    sfx.swap();
    layout();
  }

  function layout() {
    if (!cases.length) return;
    measure();
    const cw = dim.cw, ch = dim.ch, cd = dim.cd, narrow = dim.narrow;
    const sc = narrow ? 0.4 : 0.5;          // scale of a case standing on the shelf
    const so = narrow ? 0.66 : 0.72;        // scale of a case pulled out
    const pitch = cd * sc + 3;
    const M = N + NB * 2;
    const gap = (cw * so - cd * sc) / 2 + 12;
    const opened = sel >= 0;
    const focus = opened ? sel : hov;
    const fj = focus >= 0 ? focus + NB : -1;
    stack.style.setProperty("--bt", (ch * sc / 2) + "px");

    slots.forEach(function (s) {
      const j = s.j;
      let x = (j - (M - 1) / 2) * pitch;
      if (fj >= 0 && j !== fj) x += (j < fj ? -1 : 1) * (opened ? cw * 0.95 + 40 : gap);

      if (s.i < 0) {
        s.el.style.width = cd * sc + "px";
        s.el.style.height = ch * sc * (0.9 + ((j * 7) % 3) * 0.05) + "px";
        s.el.style.transform = "translate3d(" + x + "px,0,0) translate(-50%,-50%)";
        return;
      }

      const el = cases[s.i];
      const isSel = sel === s.i;
      const pulled = !opened && hov === s.i;
      const disc = el.classList.contains("view-disc");
      let wx = x, wy = 0, wz = 0, bt;
      if (isSel) {
        wx = narrow ? (disc ? 0 : cw) : cw / 2;     // centre the open pair (cover + base)
        wz = 230;
        bt = "scale(1) translateZ(0px) rotateY(0deg)";
      } else if (pulled) {
        wy = -8; wz = 150;
        bt = "scale(" + so + ") translateZ(0px) rotateY(-9deg)";
      } else {
        bt = "scale(" + sc + ") translateZ(" + (-cw / 2) + "px) rotateY(90deg)";
      }
      el.style.transform = "translate3d(" + wx + "px," + wy + "px," + wz + "px)";
      el._body.style.transform = bt;
      el.classList.toggle("is-pulled", pulled);
      el.classList.toggle("is-dim", opened && !isSel);
      el.setAttribute("aria-expanded", isSel ? "true" : "false");
    });

    stack.dataset.state = opened ? "open" : (hov >= 0 ? "hover" : "closed");
    const now = $("#counterNow");
    if (now) now.textContent = pad(active + 1);
    const hint = $("#hint");
    if (hint) {
      hint.innerHTML = '<span class="hint-dot"></span> ' +
        (opened ? "click outside or press esc to close the case"
                : hov >= 0 ? "click the case to open it" : "hover the shelf to pull out a case");
    }
  }

  function initStack() {
    if (!stack) return;
    buildShelf();
    layout();

    stack.addEventListener("pointerdown", function (e) { lastPointerType = e.pointerType; }, { passive: true });
    stack.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      hovered = true;
      pointerPos.x = e.clientX;
      pointerPos.y = e.clientY;
    });
    stack.addEventListener("pointermove", function (e) {
      pointerPos.x = e.clientX;
      pointerPos.y = e.clientY;
      if (sel >= 0) return;
      if (e.pointerType === "touch") return;
      const rect = stack.getBoundingClientRect();
      // tighter bounds
      if (e.clientX < rect.left + 40 || e.clientX > rect.right - 40 || e.clientY < rect.top + 60 || e.clientY > rect.bottom - 20) {
        hovered = false;
        if (hov >= 0) { hov = -1; layout(); }
        return;
      }
      hovered = true;
      // find closest case by center
      let closest = -1;
      let minDist = Infinity;
      cases.forEach(function (c, i) {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (d < minDist) {
          minDist = d;
          closest = i;
        }
      });
      if (closest >= 0 && minDist < 160) {
        if (hov !== closest || active !== closest) {
          hov = closest;
          active = closest;
          userTouchedAt = performance.now();
          sfx.swap();
          layout();
        }
      } else {
        hovered = false;
        if (hov >= 0) { hov = -1; layout(); }
      }
    }, { passive: true });
    stack.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      hovered = false;
      if (sel < 0 && hov >= 0) { hov = -1; layout(); }
    });
    stack.addEventListener("click", function (e) {
      if (sel >= 0 && !e.target.closest(".case") && !e.target.closest(".stack-ui")) closeCase();
    });

    $("#prevBtn") && $("#prevBtn").addEventListener("click", function () { step(-1); });
    $("#nextBtn") && $("#nextBtn").addEventListener("click", function () { step(1); });

    // idle loop: pull the next case out every 3 s unless the user is browsing
    setInterval(function () {
      if (reduceMotion) return;
      if (sel >= 0 || hovered || document.hidden) return;
      if (performance.now() - userTouchedAt < 4500) return;
      active = (active + 1) % N;
      hov = active;
      layout();
    }, 3000);
  }

  /* ------------------------------------------------------------
     Page chrome
     ------------------------------------------------------------ */
  function initChrome() {
    const nav = $("#nav");
    if (nav) {
      const onScroll = function () { nav.classList.toggle("stuck", window.scrollY > 24); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // reveal on scroll
    const reveals = $$(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.15 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (sel >= 0) closeCase();
        else if (hov >= 0) { hov = -1; layout(); }
        return;
      }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
      if (e.key === "Enter" && sel < 0) {
        const el = document.activeElement;
        if (el && el.classList && el.classList.contains("case")) { e.preventDefault(); openCase(+el.dataset.i); }
      }
    });

    // keep shapes sized correctly
    let rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        shapeSyncs.forEach(function (fn) { fn(); });
        layout();
      }, 120);
    });
  }

  /* ------------------------------------------------------------
     Gravity stars — a plain-canvas recreation of Animate UI's
     GravityStarsBackground (docs/backgrounds/gravity-stars).
     No React and no packages: the same simulation, with the page's
     own --txt as the star colour. Every documented knob lives in
     CFG below, using the component's defaults.
     ------------------------------------------------------------ */
  function initGravityStars() {
    const cv = $("#starsBg");
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;

    /* the component's props, with its defaults */
    const CFG = {
      starsCount: 75,
      starsSize: 2,
      starsOpacity: 0.75,
      glowIntensity: 15,
      glowAnimation: "ease",       // instant | ease | spring
      movementSpeed: 0.3,
      mouseInfluence: 100,
      mouseGravity: "attract",     // attract | repel
      gravityStrength: 75,
      starsInteraction: false,
      starsInteractionType: "bounce" // bounce | merge
    };

    const s = {
      w: 0, h: 0, dpr: 1, color: "#fff", stars: [],
      /* the pointer starts at the top-left corner, as in the original */
      mx: 0, my: 0, raf: 0, onScreen: true
    };

    /* stars take the text colour, so the page's ink drives them */
    const readColor = function () { s.color = getComputedStyle(cv).color || "#fff"; };

    /* scatter across the container — also used after a resize */
    const scatter = function () {
      const count = Math.max(0, Math.round(CFG.starsCount));
      s.stars = [];
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = CFG.movementSpeed * (0.5 + Math.random() * 0.5);
        s.stars.push({
          x: Math.random() * s.w, y: Math.random() * s.h,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
          r: 1 + Math.random() * CFG.starsSize,
          glow: 0, gv: 0, target: 0
        });
      }
    };

    const resize = function () {
      const r = cv.getBoundingClientRect();
      s.w = Math.max(1, r.width);
      s.h = Math.max(1, r.height);
      s.dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(s.w * s.dpr);
      cv.height = Math.round(s.h * s.dpr);
      g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      readColor();
      scatter();                   // a resize scatters the stars again
      paint();
    };

    /* one simulation step per displayed frame — no dt, so a 120Hz
       screen genuinely advances the field faster than a 60Hz one */
    const step = function () {
      const stars = s.stars;
      const infl = CFG.mouseInfluence, infl2 = infl * infl;
      const sign = CFG.mouseGravity === "repel" ? -1 : 1;
      const force = (CFG.gravityStrength / 100) * 0.35;

      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        const dx = s.mx - a.x, dy = s.my - a.y;
        const d2 = dx * dx + dy * dy;
        let near = 0;
        if (d2 < infl2) {
          const d = Math.sqrt(d2) || 1;
          near = 1 - d / infl;
          const f = force * near * sign;
          a.vx += (dx / d) * f;
          a.vy += (dy / d) * f;
        }
        a.target = near * near;

        /* the glow grows and fades its own way */
        if (CFG.glowAnimation === "instant") {
          a.glow = a.target;
        } else if (CFG.glowAnimation === "spring") {
          a.gv += (a.target - a.glow) * 0.12;
          a.gv *= 0.78;
          a.glow = clamp(a.glow + a.gv, 0, 1.4);
        } else {
          a.glow += (a.target - a.glow) * 0.08;
        }
      }

      /* stars that meet either bounce or attract-and-glow */
      if (CFG.starsInteraction && stars.length > 1) {
        const merge = CFG.starsInteractionType === "merge";
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const a = stars[i], b = stars[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 144 || d2 < 0.0001) continue;
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
            if (merge) {
              const f = 0.02 * (1 - d / 12);
              a.vx += nx * f; a.vy += ny * f;
              b.vx -= nx * f; b.vy -= ny * f;
              a.glow = Math.min(1.4, a.glow + 0.05);
              b.glow = Math.min(1.4, b.glow + 0.05);
            } else {
              /* elastic bounce along the collision normal */
              const va = a.vx * nx + a.vy * ny;
              const vb = b.vx * nx + b.vy * ny;
              if (va - vb <= 0) continue;
              a.vx += (vb - va) * nx; a.vy += (vb - va) * ny;
              b.vx += (va - vb) * nx; b.vy += (va - vb) * ny;
              const push = (12 - d) / 2;
              a.x -= nx * push; a.y -= ny * push;
              b.x += nx * push; b.y += ny * push;
            }
          }
        }
      }

      /* drift, slow down little by little, wrap around the edges */
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        a.vx *= 0.992;
        a.vy *= 0.992;
        a.x += a.vx;
        a.y += a.vy;
        const m = a.r + 2;
        if (a.x < -m) a.x = s.w + m;
        else if (a.x > s.w + m) a.x = -m;
        if (a.y < -m) a.y = s.h + m;
        else if (a.y > s.h + m) a.y = -m;
      }
    };

    const paint = function () {
      g.clearRect(0, 0, s.w, s.h);
      g.fillStyle = s.color;
      g.shadowColor = s.color;
      for (let i = 0; i < s.stars.length; i++) {
        const a = s.stars[i];
        const glow = clamp(a.glow, 0, 1.4);
        g.globalAlpha = clamp(CFG.starsOpacity * (0.6 + 0.4 * glow), 0, 1);
        g.shadowBlur = CFG.glowIntensity * (0.25 + glow);
        g.beginPath();
        g.arc(a.x, a.y, a.r * (1 + 0.5 * glow), 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
    };

    /* pause off screen and while the tab is hidden */
    const sync = function () {
      const shouldRun = s.onScreen && !document.hidden && !reduceMotion;
      if (shouldRun && !s.raf) {
        const frame = function () {
          step();
          paint();
          s.raf = requestAnimationFrame(frame);
        };
        s.raf = requestAnimationFrame(frame);
      } else if (!shouldRun && s.raf) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      }
    };

    resize();
    if (reduceMotion) return;      // the stars hold still

    /* the whole page drives the pointer; its last position keeps acting */
    window.addEventListener("pointermove", function (e) {
      s.mx = e.clientX;
      s.my = e.clientY;
    }, { passive: true });

    document.addEventListener("visibilitychange", sync);

    if (typeof IntersectionObserver === "function") {
      const io = new IntersectionObserver(function (entries) {
        s.onScreen = entries[0].isIntersecting;
        sync();
      });
      io.observe(cv);
    }

    /* a theme flip changes currentColor; pick the new ink up */
    new MutationObserver(readColor).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });

    window.addEventListener("resize", resize);
    sync();
  }

  /* ------------------------------------------------------------
     ASCII wake — by Bencho (bencho.dev/licence), MIT licensed.
     Ported to vanilla JS/canvas so the root portfolio keeps zero
     dependencies. Original comments kept; Bencho's --fill-on / --ink
     tokens map to this project's own silver ink in style.css.
     ------------------------------------------------------------ */
  function initAsciiCube() {
    const cv = $("#asciiCube");
    if (!cv) return;

    /* ══ ASCII wake ═══════════════════════════════════════════
       A cube drawn in ink dots, the dots shrinking toward
       its edge like a halftone. The pointer drags a wake through it:
       right under the hand the characters thicken to their densest
       and stay that way while the hand rests, and
       along the path it came from they thin back out, @ to # to + to
       a dot, as the wake cools. The glyphs lean toward the hand while
       it is near. Press and a ring goes out from the press.

       ── A GRID OF NUMBERS, THEN A RAMP ──────────────────────
       Every cell holds one number. The hand adds to it along the
       line it moved,
       so a fast stroke leaves no gaps; every frame the whole grid
       cools by the same fraction. The number picks a character off
       a ramp of glyphs, lightest to densest. That is the whole
       effect — the same field-then-palette idea as the Heat map,
       with characters where the heat map has colours.

       ── THE SHIMMER ─────────────────────────────────────────
       A cell that is in the wake picks its glyph with a little
       noise, re-dealt every few frames, so the warm part of the wake
       flickers between neighbouring characters the way a terminal
       redraw does. The cold field never flickers. */
    const W = 360, H = 240;
    const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

    /* lightest to densest; the first is always a blank */
    const RAMPS = {
      Classic: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
      Blocks: [" ", "·", "░", "▒", "▓", "█"],
      Dots: [" ", "·", "•", "●"],
      Binary: [" ", ".", ":", "0", "1"]
    };
    const ramp = RAMPS.Classic;

    /* ── the shape: a cube, seen corner on ──────────────────────
       A solid, perfectly symmetric shape: three faces of an isometric
       cube make a hexagon, lit from above so each face has its own
       strength — the top brightest, the left in half light, the right
       in shade — with a little gradient across each for depth and a
       crisp line where two faces meet. Returns the dot size directly,
       0 to 1, so the halftone is dense right to the outline.

       The dots are the ink, so which face is dense depends on the page:
       on dark the dots are light and the lit top is the dense one; on
       light they are dark, so it is printed like a halftone — the lit top
       sparse, the shaded side dense. `lit` is the dot size for a face's
       light: the same value, read the right way round for the page. */
    const CUBE = 112;
    function cube(x, y, dark) {
      /* no face lighter than a third of a full dot: the faintest still
         reads as a face, and is still a field the wake can write on */
      const lit = (v) => 0.35 + 0.65 * clamp(dark ? v : 1.09 - v, 0, 1);
      const R = CUBE;
      const c = Math.cos(Math.PI / 6) * R, h = R / 2;
      /* the corners: top, upper right, bottom, lower left, upper left; the middle is 0,0 */
      const T = [0, -R], UR = [c, -h], B = [0, R], LL = [-c, h], UL = [-c, -h];
      /* where (x, y) sits in a face spanned from o along a and b: s, t in 0..1 when inside */
      const along = (o, p, q) => {
        const ax = p[0] - o[0], ay = p[1] - o[1], bx = q[0] - o[0], by = q[1] - o[1];
        const dx = x - o[0], dy = y - o[1];
        const det = ax * by - ay * bx;
        return [(dx * by - dy * bx) / det, (ax * dy - ay * dx) / det];
      };
      const inside = (f) => f[0] >= 0 && f[0] <= 1 && f[1] >= 0 && f[1] <= 1;
      /* the seams: a bright line where two faces meet, and the outline */
      const seam = (v) => (v < 0.045 ? 1 : 0);
      const top = along(T, UR, UL);
      if (inside(top)) {
        const s = top[0], t = top[1];
        return seam(1 - s) || seam(1 - t) ? 1 : lit(0.96 - 0.1 * (s + t) / 2);
      }
      const left = along(UL, [0, 0], LL);
      if (inside(left)) {
        const s = left[0], t = left[1];
        return seam(s) ? 1 : lit(0.56 - 0.12 * t);
      }
      const right = along([0, 0], UR, B);
      if (inside(right)) {
        const s = right[0], t = right[1];
        return seam(s) || seam(t) ? 1 : lit(0.13 - 0.05 * s);
      }
      return 0;
    }

    /* below this much heat a cell is the field: a dot */
    const COLD = 0.04;
    /* how long a press's ring takes to spread and fade, s */
    const RING_S = 2.2;
    /* the knobs Bencho exposes, fixed to this page's defaults */
    const size = 10, reach = 50, trail = 1.2, pull = 40;

    const st = {
      cols: 0, rows: 0, cw: 0, ch: 0, ox: 0, oy: 0, font: "",
      /* the wake, one number per cell */
      heat: new Float32Array(0),
      /* how far inside the shape each cell is, 0 outside to 1 */
      mask: new Float32Array(0),
      /* the hand: where it is, where it was last stamped, and how
         present it is (for the lean, which follows it out) */
      hx: -999, hy: -999, lx: NaN, ly: NaN, near: 0, inside: false,
      /* rings going out from presses */
      rings: [], deal: 0, tick: 0, raf: 0, ratio: 1
    };

    /* a stable 0..1 per cell per deal, so the shimmer is noise that
       holds for a few frames rather than flicker every frame */
    function hash(k, n) {
      let h = (k * 374761393 + n * 668265263) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }

    /* the grid for a character size, cut to the shape */
    const build = function () {
      const r = Math.min(2, window.devicePixelRatio || 1);
      st.ratio = r;
      cv.width = Math.round(W * r);
      cv.height = Math.round(H * r);
      /* which way round the shading reads: is the ink light (a dark page)? */
      const ink = getComputedStyle(cv).color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
      const dark = (ink[0] * 0.299 + ink[1] * 0.587 + ink[2] * 0.114) > 128;
      /* rows a little tighter than the face's own leading, so the
         resting dots sit on an even grid rather than in stripes */
      st.ch = size * 0.82;
      st.cw = size * 0.62;
      st.cols = Math.floor(W / st.cw - 0.5);
      st.rows = Math.floor(H / st.ch);
      st.font = "500 " + size + "px " + MONO;
      st.heat = new Float32Array(st.cols * st.rows);
      st.mask = new Float32Array(st.cols * st.rows);
      /* the grid centred in the block, whatever is left over split */
      st.ox = (W - st.cols * st.cw) / 2;
      st.oy = (H - st.rows * st.ch) / 2;
      for (let j = 0; j < st.rows; j++) {
        for (let i = 0; i < st.cols; i++) {
          const x = st.ox + (i + 0.5 + (j & 1) * 0.5) * st.cw - W / 2;
          const y = st.oy + (j + 0.5) * st.ch - H / 2;
          st.mask[j * st.cols + i] = cube(x, y, dark);
        }
      }
    };

    /* heat dropped on the grid in a soft round at a point */
    const stamp = function (x, y, rad, amt) {
      x -= st.ox; y -= st.oy;
      const c0 = Math.max(0, Math.floor((x - rad) / st.cw));
      const c1 = Math.min(st.cols - 1, Math.ceil((x + rad) / st.cw));
      const r0 = Math.max(0, Math.floor((y - rad) / st.ch));
      const r1 = Math.min(st.rows - 1, Math.ceil((y + rad) / st.ch));
      const R2 = rad * rad;
      for (let j = r0; j <= r1; j++) {
        const dy = (j + 0.5) * st.ch - y;
        for (let i = c0; i <= c1; i++) {
          const dx = (i + 0.5) * st.cw - x;
          const q = (dx * dx + dy * dy) / R2;
          if (q >= 1) continue;
          const t = 1 - q;
          const k = j * st.cols + i;
          st.heat[k] = Math.min(1, st.heat[k] + amt * t * t);
        }
      }
    };

    /* the wake's width: one cell's worth at 0, a broad swathe at 100 */
    const radius = function () { return 12 + (clamp(reach, 0, 100) / 100) * 58; };

    const paint = function () {
      if (!st.cols) return;
      const g = cv.getContext("2d");
      if (!g) return;
      g.setTransform(st.ratio, 0, 0, st.ratio, 0, 0);
      g.clearRect(0, 0, W, H);
      /* one ink for everything, the theme's own */
      g.fillStyle = getComputedStyle(cv).color;
      /* the resting dot: a real circle rather than a full stop, so
         it can be bigger than the face draws one */
      /* a halftone: the dot's AREA follows the density, up to nearly
         touching its neighbours where the shape is fullest */
      const dot = Math.min(st.cw, st.ch) * 0.44;
      g.font = st.font;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const top = ramp.length - 1;
      /* the lean: up to most of a cell toward the hand, fading with
         distance over twice the wake's width */
      const lean = (clamp(pull, 0, 100) / 100) * st.near;
      const rad = radius();
      const far = rad * 2;
      const far2 = far * far;
      /* the hand's own heat, worked out fresh each frame rather than
         stored, so it never cools: a hand at rest keeps its patch */
      const R2 = rad * rad;
      /* the rings, as a band that passes rather than heat that stays:
         a press leaves nothing behind it, only the wave going out */
      const rings = st.rings.map(function (r) {
        /* slow and smooth: it eases out as it spreads, a soft wide band
           that fades over its whole life rather than snapping off */
        const p = r.t / RING_S;
        const e = 1 - Math.pow(1 - p, 3);
        return { x: r.x, y: r.y, R: 8 + e * 260, amp: 0.6 * (1 - p) * (1 - p) * Math.min(1, p * 6) };
      });
      for (let j = 0; j < st.rows; j++) {
        const y = st.oy + (j + 0.5) * st.ch;
        for (let i = 0; i < st.cols; i++) {
          const k = j * st.cols + i;
          const m = st.mask[k];
          if (m <= 0) continue;
          /* odd rows sit half a cell over: a halftone screen */
          const cx = st.ox + (i + 0.5 + (j & 1) * 0.5) * st.cw;
          let h = st.heat[k];
          if (st.near > 0.002) {
            const q = ((cx - st.hx) ** 2 + (y - st.hy) ** 2) / R2;
            if (q < 1) h = Math.max(h, 0.95 * st.near * (1 - q) * (1 - q));
          }
          for (let n = 0; n < rings.length; n++) {
            const r = rings[n];
            /* a wide band, so the ring is a soft swell rather than a line */
            const d = (Math.hypot(cx - r.x, y - r.y) - r.R) / 24;
            if (d > -2.5 && d < 2.5) h += r.amp * Math.exp(-d * d);
          }
          /* the faint faces take a little less of the wake, but only a
             little: scaled by the density outright, the lightest face
             never got warm enough to show a glyph at all */
          h *= 0.55 + 0.45 * m;
          const v = Math.min(1, h);
          /* the warm part shimmers, the cold field holds still */
          let u = v * top + 0.5;
          if (h > COLD) u += (hash(k, st.deal) - 0.5) * 1.6 * Math.min(1, h * 2);
          const idx = clamp(Math.floor(u), 1, top);
          let x = cx;
          let yy = y;
          if (lean > 0.002) {
            const dx = st.hx - x, dy = st.hy - yy;
            const d2 = dx * dx + dy * dy;
            if (d2 < far2) {
              const f = 1 - d2 / far2;
              const d = Math.sqrt(d2) || 1;
              /* toward the hand by a share of the gap, never past it */
              const mm = Math.min(d * 0.6, 14 * lean * f * f);
              x += (dx / d) * mm;
              yy += (dy / d) * mm;
            }
          }
          /* cold, or the lightest step: the dot, smaller toward the
             shape's edge, so the wake fades back into the field
             without a glyph popping in or out */
          if (h <= COLD || idx === 1) {
            g.globalAlpha = 1;
            g.beginPath();
            g.arc(x, yy, Math.max(0.45, dot * Math.sqrt(m)), 0, Math.PI * 2);
            g.fill();
            continue;
          }
          g.globalAlpha = 1;
          g.fillText(ramp[idx], x, yy);
        }
      }
      g.globalAlpha = 1;
    };

    /* the loop runs only while the wake is warm or the hand is moving */
    const run = function () {
      if (st.raf) return;
      let prev = performance.now();
      const step = function (t) {
        const dt = Math.min(0.05, (t - prev) / 1000);
        prev = t;
        /* the cooling: the same fraction off every cell, so a trail
           of seconds T is down to a twentieth after T */
        const keep = Math.exp((-dt * 3) / Math.max(0.1, trail));
        let warm = 0;
        for (let k = 0; k < st.heat.length; k++) {
          const h = st.heat[k] * keep;
          st.heat[k] = h < 0.003 ? 0 : h;
          if (h > warm) warm = h;
        }
        /* the rings run outward for RING_S and are gone */
        st.rings = st.rings.filter(function (r) { return (r.t += dt) < RING_S; });
        /* the lean follows the hand in and out */
        st.near += ((st.inside ? 1 : 0) - st.near) * (1 - Math.pow(0.004, dt));
        st.tick += dt;
        if (st.tick > 0.07) { st.tick = 0; st.deal++; }
        paint();
        const still = warm === 0 && !st.rings.length && Math.abs((st.inside ? 1 : 0) - st.near) < 0.004;
        st.raf = still ? 0 : requestAnimationFrame(step);
      };
      st.raf = requestAnimationFrame(step);
    };

    build();
    paint();
    if (reduceMotion) return;   /* the field stays static, no wake loop */

    /* the hand's position in the canvas's own units — it may be scaled */
    const where = function (e) {
      const r = cv.getBoundingClientRect();
      const k = r.width / W;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };

    /* the hand stamps along the whole line since its last frame, a
       stamp every third of a radius, so a flick is one stroke */
    const move = function (e) {
      const pos = where(e);
      const rad = radius();
      if (Number.isNaN(st.lx)) { st.lx = pos.x; st.ly = pos.y; }
      const d = Math.hypot(pos.x - st.lx, pos.y - st.ly);
      const n = Math.max(1, Math.ceil(d / (rad / 3)));
      for (let k = 1; k <= n; k++) {
        const f = k / n;
        stamp(st.lx + (pos.x - st.lx) * f, st.ly + (pos.y - st.ly) * f, rad, 0.5);
      }
      st.lx = pos.x; st.ly = pos.y; st.hx = pos.x; st.hy = pos.y;
      st.inside = true;
      run();
    };

    cv.addEventListener("pointerenter", function (e) { st.lx = NaN; move(e); });
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", function () {
      st.inside = false; st.lx = NaN; run();
    });
    cv.addEventListener("pointerdown", function (e) {
      const pos = where(e);
      st.rings.push({ x: pos.x, y: pos.y, t: 0 });
      run();
    });
  }

  /* ------------------------------------------------------------
     First-load intro — boot screen first, then the page
     1. black boot screen: a dim gamepad fills in, one control lights
        up per step while a loading bar runs (min ~2.6 s, waits for load)
     2. "PLAYER 1 READY" -> the screen fades
     3. hero copy, side shapes and scroll cue arrive
     ------------------------------------------------------------ */
  function initIntro() {
    window.__introStart = performance.now();
    const root = document.documentElement;
    const boot = $("#boot");
    const heroCopy = $(".hero-copy");

    const skip = function () {
      root.classList.remove("intro");
      if (heroCopy) heroCopy.classList.add("in");
      if (boot) boot.remove();
    };

    if (reduceMotion || !boot || !heroCopy) return skip();
    if (location.hash && location.hash !== "#top") return skip();
    if (window.scrollY > 10) return skip();

    root.classList.add("intro");

    const pad = $("#bootPad");
    if (pad) pad.innerHTML = padArt("bootG");
    const order = [".pb-dpad", ".pb-ls", ".pb-rs", ".pb-y", ".pb-x", ".pb-b",
                   ".pb-a", ".pb-lb", ".pb-rb", ".pb-sel", ".pb-start", ".pb-home"];
    const parts = order.map(function (s) { return $(s, boot); }).filter(Boolean);

    const fill = $("#bootFill");
    const pct = $("#bootPct");
    const label = $("#bootLabel");

    const MIN_MS = 2600;      // shortest boot screen
    const MAX_WAIT = 3800;    // never hold at 92% longer than this
    const t0 = performance.now();
    let loaded = document.readyState === "complete";
    if (!loaded) window.addEventListener("load", function () { loaded = true; }, { once: true });

    let done = false;
    let raf = 0;
    let safety = null;
    let onScroll = null;

    const finish = function () {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      if (onScroll) window.removeEventListener("scroll", onScroll);

      boot.classList.add("out");

      setTimeout(function () {
        root.classList.remove("intro");
        heroCopy.classList.add("in");
        boot.remove();
      }, 450);
    };

    const tick = function (now) {
      if (done) return;
      const t = now - t0;
      let p = Math.min(1, t / MIN_MS);
      if (!loaded && t < MAX_WAIT) p = Math.min(p, 0.92);

      boot.style.setProperty("--p", p.toFixed(3));
      if (fill) fill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      if (pct) pct.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
      const lit = Math.min(parts.length, Math.floor(p * (parts.length + 1)));
      parts.forEach(function (el, i) { el.classList.toggle("on", i < lit); });

      if (p >= 1) {
        boot.classList.add("done");
        if (label) label.textContent = "PLAYER 1 READY";
        setTimeout(finish, 550);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    safety = setTimeout(finish, 5200);
    onScroll = function () { if (window.scrollY > 10) finish(); };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------
     Boot
     ------------------------------------------------------------ */
  function initSfx() {
    const btn = $("#sfxBtn");
    const sync = function () {
      document.documentElement.dataset.sfx = sfx.enabled ? "on" : "off";
      if (!btn) return;
      btn.setAttribute("aria-pressed", sfx.enabled ? "true" : "false");
      btn.setAttribute("aria-label", "Sound effects " + (sfx.enabled ? "on" : "off"));
      btn.title = "Sound effects: " + (sfx.enabled ? "on" : "off");
    };
    sync();
    if (btn) {
      btn.addEventListener("click", function () {
        sfx.toggle();
        sync();
      });
    }
    // browsers only allow audio after a real gesture — arm the context then
    ["pointerdown", "keydown"].forEach(function (t) {
      window.addEventListener(t, function () { sfx.unlock(); }, { once: true, capture: true, passive: true });
    });
  }

  /* ------------------------------------------------------------
     Universal UI sound: hover any control, click any control
     ------------------------------------------------------------ */
  function initUiSound() {
    const RICH = ".case, #prevBtn, #nextBtn, #sfxBtn, [data-case-close], [data-case-view], .dlg-bubble";

    document.addEventListener("pointerover", function (e) {
      if (e.pointerType === "touch") return;
      const el = e.target.closest("a, button, .dlg-bubble");
      if (!el || el.disabled) return;
      if (el.matches(".case")) return;              // cases have their own richer cue
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      sfx.hover();
    }, { passive: true });

    document.addEventListener("click", function (e) {
      const el = e.target.closest("a, button, [data-close], .dlg-bubble");
      if (!el || el.disabled) return;
      if (el.matches(RICH)) return;                 // these already play swap/open/close/blip
      sfx.press();
    });
  }

  function boot() {
    initShapes();
    initScroll3D();
    initStack();
    initChrome();
    initUiSound();
    initSfx();
    initGravityStars();
    initAsciiCube();
    initIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
