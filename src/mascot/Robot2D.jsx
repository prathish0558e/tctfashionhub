import { useState } from "react";
import { handleRobotTap } from "./support.js";

/*
 * Fallback assistant — a hand-built SVG robot resting on a cloud.
 *
 * Shown when WebGL2 is missing, when the three.js scene throws, when the
 * context is lost, or when the first frame never lands (some iPhones and
 * iPads). It is drawn with the same brand palette and uses the same store
 * phase as the 3D mascot, so the chat hologram and the conversation behave
 * exactly the same — the character is simply 2D instead of 3D.
 *
 * Nothing here depends on a CSS animation for visibility: animations only add
 * motion, so a frozen animation clock can never hide the robot.
 */

/* `awake` comes straight from the store snapshot (phase/chatOpen) so the eyes
   and antenna always match the conversation — no polling, no stale state. */
export default function Robot2D({ hitPos, onTap, awake = false, busy = false, open = false }) {
  const [hint, setHint] = useState(true);

  if (!hitPos) return null;

  return (
    <button
      type="button"
      className={`tct2d ${awake ? "is-awake" : "is-asleep"}${busy ? " is-busy" : ""}${open ? " is-open" : ""}`}
      style={{ left: `${hitPos.x}px`, top: `${hitPos.y}px` }}
      onClick={(e) => handleRobotTap(e, () => { setHint(false); onTap?.(); })}
      aria-label={awake ? "TCT Assistant is here — open the chat" : "Wake up the TCT Assistant"}
      title={awake ? "Ask the TCT Assistant" : "Psst… wake the robot"}
    >
      <span className="tct2d-halo" aria-hidden="true" />
      {hint && !open && <span className="tct2d-chip">Ask TCT Assistant</span>}

      <svg className="tct2d-art" viewBox="0 0 200 212" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="t2-shell" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#e9f1ff" />
            <stop offset="1" stopColor="#c9d9f6" />
          </linearGradient>
          <linearGradient id="t2-visor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#122036" />
            <stop offset="1" stopColor="#284a7a" />
          </linearGradient>
          <linearGradient id="t2-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0d6efd" />
            <stop offset="0.55" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
          <radialGradient id="t2-eye" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#0ea5e9" />
          </radialGradient>
        </defs>

        {/* ---------- cloud ---------- */}
        <g className="tct2d-cloud">
          <ellipse cx="100" cy="186" rx="74" ry="17" fill="#b9c9e8" opacity="0.5" />
          <circle cx="52" cy="163" r="26" fill="#ffffff" />
          <circle cx="100" cy="150" r="36" fill="#ffffff" />
          <circle cx="148" cy="163" r="26" fill="#ffffff" />
          <ellipse cx="100" cy="176" rx="80" ry="20" fill="#ffffff" />
          <ellipse cx="100" cy="180" rx="64" ry="13" fill="#dbe6f9" />
        </g>

        {/* ---------- antenna ---------- */}
        <g className="tct2d-antenna">
          <rect x="97" y="30" width="6" height="24" rx="3" fill="#9fb3d6" />
          <circle className="tct2d-tip" cx="100" cy="26" r="9" fill="url(#t2-accent)" />
        </g>

        {/* ---------- head ---------- */}
        <g className="tct2d-head">
          <rect x="60" y="50" width="80" height="62" rx="24" fill="url(#t2-shell)" stroke="#b6c8e8" strokeWidth="2" />
          <circle cx="58" cy="82" r="9" fill="#9fb3d6" />
          <circle cx="142" cy="82" r="9" fill="#9fb3d6" />
          <rect x="70" y="64" width="60" height="34" rx="17" fill="url(#t2-visor)" />
          <g className="tct2d-eyes">
            <circle className="tct2d-eye" cx="87" cy="81" r="8" fill="url(#t2-eye)" />
            <circle className="tct2d-eye" cx="113" cy="81" r="8" fill="url(#t2-eye)" />
          </g>
          <path className="tct2d-smile" d="M90 100c4 5 16 5 20 0" fill="none" stroke="#1f3a63" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* ---------- body ---------- */}
        <g className="tct2d-body">
          <rect x="72" y="116" width="56" height="46" rx="18" fill="url(#t2-shell)" stroke="#b6c8e8" strokeWidth="2" />
          <rect x="64" y="124" width="16" height="30" rx="8" fill="#eef4ff" stroke="#b6c8e8" strokeWidth="2" />
          <rect x="120" y="124" width="16" height="30" rx="8" fill="#eef4ff" stroke="#b6c8e8" strokeWidth="2" />
          <circle cx="100" cy="139" r="14" fill="#ffffff" stroke="#0d6efd" strokeWidth="2" />
        </g>

        {/* ---------- sleep bubbles ---------- */}
        <g className="tct2d-zzz" fill="#0d6efd" opacity="0.85">
          <text x="158" y="70" fontSize="20" fontWeight="700">z</text>
          <text x="170" y="52" fontSize="15" fontWeight="700">z</text>
        </g>
      </svg>

      {/* the real TCT logo, laid over the badge ring the SVG draws */}
      <img className="tct2d-badge" src="/tct-logo.png" alt="" width="20" height="18" />
    </button>
  );
}
