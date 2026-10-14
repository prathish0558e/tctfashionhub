/*
 * Device / WebGL capability probe for the 3D mascot.
 *
 * The robot used to be "all or nothing": on some iPhones and iPads the WebGL
 * context either fails to initialise or is killed by the OS, and the character
 * silently disappeared. Everything here is best-effort feature detection so
 * TctMascot can fall back to the CSS robot instead of showing nothing.
 */

const ua = () => (typeof navigator === "undefined" ? "" : navigator.userAgent || "");

/* iPhone / iPad / iPod — including iPadOS 13+, which reports itself as a
   Macintosh with touch support. */
export const IS_IOS = (() => {
  if (typeof navigator === "undefined") return false;
  if (/iP(hone|ad|od)/.test(ua())) return true;
  return navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1;
})();

/* Devices where the full-quality scene (PMREM environment, antialias, high
   DPR) is more risk than reward. Desktops stay untouched. */
export const LOW_POWER = (() => {
  if (typeof navigator === "undefined") return false;
  if (IS_IOS) return true;
  const mem = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  return (typeof mem === "number" && mem > 0 && mem <= 2) ||
    (typeof cores === "number" && cores > 0 && cores <= 3);
})();

/* `?tct2d=1` forces the CSS robot, `?tct3d=1` forces the 3D one. Handy on a
   real iPhone when you want to prove which path a visitor is on. */
function forced() {
  if (typeof window === "undefined") return null;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get("tct2d") === "1") return "2d";
    if (q.get("tct3d") === "1") return "3d";
  } catch { /* ignore */ }
  return null;
}

/* A real, functional probe: a handle alone is not enough — Safari hands one
   out on some devices and then fails on the first real GL call. */
export function probeWebGL() {
  const mode = forced();
  if (mode === "2d") return { ok: false, reason: "forced-2d" };
  if (mode === "3d") return { ok: true, reason: "forced-3d" };
  if (typeof document === "undefined") return { ok: false, reason: "no-document" };
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 8;
    const attrs = {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    };
    /* three r163+ needs WebGL2 — WebGL1-only devices must use the CSS robot. */
    const gl = canvas.getContext("webgl2", attrs) || canvas.getContext("webgl2");
    if (!gl) return { ok: false, reason: "no-webgl2" };

    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    if (maxTex < 2048) return { ok: false, reason: "small-max-texture" };

    /* Upload + read back one pixel: proves the context can actually draw. */
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([13, 110, 253, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.05, 0.43, 0.99, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const px = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const err = gl.getError();
    gl.deleteTexture(tex);
    if (err !== 0) return { ok: false, reason: `gl-error-${err}` };
    return { ok: true, reason: "webgl2" };
  } catch (error) {
    return { ok: false, reason: `threw:${error?.name || "error"}` };
  }
}

/* ------------------------------------------------------------------ */
/* Tap arbitration                                                     */
/*                                                                     */
/* The robot is a fixed overlay above scrollable content (hero CTAs,   */
/* site cards…), so its hit box inevitably covers page controls on     */
/* small screens. Two rules keep both sides usable:                    */
/*   • the robot's CORE (head/torso band) always belongs to the robot  */
/*     — it is visually covered anyway, exactly like a chat head;      */
/*   • the DECORATION ring (cloud puffs, halo, glow) passes taps       */
/*     through to whatever real link/button/field sits underneath,     */
/*     so the mascot never steals a tap from content the visitor can   */
/*     actually see.                                                   */
/* ------------------------------------------------------------------ */

/* Forward one tap to the page control under (x, y), if any. Returns
   true when something real was clicked instead of the robot. */
function forwardTapToPageControl(el, x, y) {
  if (!el || typeof document === "undefined") return false;
  const prev = el.style.pointerEvents;
  el.style.pointerEvents = "none";
  let under = null;
  try {
    under = document.elementFromPoint(x, y);
  } finally {
    el.style.pointerEvents = prev;
  }
  if (!under || under === el) return false;
  const control = under.closest(
    "a[href], button, input, textarea, select, label, [role=button]"
  );
  // Never forward into the mascot's own UI (chat panel, robot, chip).
  if (!control || control.closest(".tct3d-wrap, .tct2d, .tct3d-panel")) return false;
  control.click();
  return true;
}

/* Single entry point for both robots (3D hit button + SVG fallback).
   `onRobot` is the wake/open action. Keyboard activation (detail 0,
   which has no pointer coordinates) always belongs to the robot. */
export function handleRobotTap(event, onRobot) {
  const el = event.currentTarget;
  // Keyboard activation reports no pointer coordinates (0, 0). Touch taps do
  // carry real coordinates even when some browsers report detail as 0, so
  // only the coordinate test is trusted for the "always the robot" path.
  const keyboard = event.clientX === 0 && event.clientY === 0;
  if (keyboard || !el) {
    onRobot();
    return;
  }
  const r = el.getBoundingClientRect();
  const nx = r.width ? (event.clientX - r.left) / r.width : 0.5;
  const ny = r.height ? (event.clientY - r.top) / r.height : 0.5;
  // Core band ≈ the character's head + torso (upper-middle of the box).
  const onCore = nx > 0.25 && nx < 0.75 && ny > 0.15 && ny < 0.75;
  if (!onCore && forwardTapToPageControl(el, event.clientX, event.clientY)) return;
  onRobot();
}
