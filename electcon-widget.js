/*!
 * ELECTCON™ Widget — Election Integrity Watch
 * © 2026 Parallax Advisory LLC · American Muckrakers II
 * Free to embed with attribution.
 *
 * USAGE:
 *   <div id="electcon-widget"></div>
 *   <script src="https://americanmuckrakers.com/electcon-widget.js"></script>
 */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  const JSON_URL   = 'https://electcon.github.io/electcon/electcon-level.json';
  const SITE_URL   = 'https://americanmuckrakers.com/electcon';
  const TARGET_ID  = 'electcon-widget';

  // ── Level metadata ────────────────────────────────────────────────────────
  const LEVELS = {
    5: { label: 'Normal',   desc: 'No significant threat',    color: '#16a34a' },
    4: { label: 'Elevated', desc: 'Threat actors active',     color: '#ca8a04' },
    3: { label: 'High',     desc: 'Organized interference',   color: '#ea580c' },
    2: { label: 'Severe',   desc: 'Active subversion',        color: '#dc2626' },
    1: { label: 'Critical', desc: 'Election in danger',       color: '#7f1d1d' },
  };

  // ── Inject styles (once) ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('eiw-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'eiw-widget-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=IBM+Plex+Mono:wght@400;700&display=swap');

      .eiw-w {
        font-family: 'IBM Plex Mono', monospace;
        background: #0d0d0d;
        border: 1px solid #2a2a2a;
        border-radius: 6px;
        overflow: hidden;
        width: 280px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      }
      .eiw-w * { box-sizing: border-box; margin: 0; padding: 0; }

      /* Header */
      .eiw-hdr {
        background: #111;
        border-bottom: 2px solid #b91c1c;
        padding: 9px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .eiw-brand {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 0.62rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #e5e7eb;
      }
      .eiw-brand-red { color: #ef4444; }
      .eiw-live {
        display: flex; align-items: center; gap: 5px;
        font-size: 0.54rem; color: #6b7280; letter-spacing: 0.07em;
      }
      .eiw-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #ef4444; flex-shrink: 0;
        animation: eiw-pulse 2s ease-in-out infinite;
      }
      @keyframes eiw-pulse {
        0%,100% { opacity:1; transform:scale(1); }
        50%      { opacity:0.4; transform:scale(0.65); }
      }

      /* Score */
      .eiw-score {
        padding: 14px 14px 10px;
        display: flex; align-items: center; gap: 12px;
        border-bottom: 1px solid #1c1c1c;
      }
      .eiw-score-num {
        font-family: 'Syne', sans-serif;
        font-weight: 900;
        font-size: 2.8rem;
        line-height: 1;
        min-width: 48px;
        text-align: center;
        transition: color 0.4s;
      }
      .eiw-score-label {
        font-size: 0.68rem; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        margin-bottom: 2px;
      }
      .eiw-score-erc { font-size: 0.58rem; color: #6b7280; letter-spacing: 0.06em; }

      /* Headline */
      .eiw-headline {
        font-size: 0.62rem; color: #9ca3af;
        padding: 6px 14px 10px;
        border-bottom: 1px solid #1c1c1c;
        line-height: 1.5; letter-spacing: 0.03em;
      }

      /* Levels */
      .eiw-levels { padding: 10px 0 0; }
      .eiw-level {
        display: flex; align-items: center; gap: 10px;
        padding: 5px 14px;
        opacity: 0.28;
        transition: opacity 0.2s, background 0.2s, transform 0.18s, box-shadow 0.18s;
        cursor: pointer;
        border-left: 3px solid transparent;
        position: relative; z-index: 1;
      }
      .eiw-level:hover {
        opacity: 0.85;
        transform: translateX(4px) scale(1.03);
        background: rgba(255,255,255,0.06);
        border-left-color: currentColor;
        box-shadow: -3px 0 12px rgba(0,0,0,0.4);
        z-index: 2;
      }
      .eiw-level.eiw-active {
        opacity: 1;
        border-left-color: currentColor;
        background: rgba(255,255,255,0.05);
        box-shadow: -2px 0 10px rgba(0,0,0,0.3);
      }
      .eiw-level.eiw-active:hover {
        transform: translateX(5px) scale(1.04);
      }
      .eiw-level-num {
        font-family: 'Syne', sans-serif;
        font-weight: 900; font-size: 1.1rem;
        line-height: 1; min-width: 18px; text-align: center;
      }
      .eiw-level-name {
        font-size: 0.62rem; font-weight: 700;
        letter-spacing: 0.09em; text-transform: uppercase;
      }
      .eiw-level-desc {
        font-size: 0.54rem; color: #6b7280;
        letter-spacing: 0.04em; margin-top: 1px;
      }
      .eiw-level.eiw-active .eiw-level-desc { color: #9ca3af; }

      /* Bar */
      .eiw-bar-track {
        margin: 10px 14px 0;
        height: 3px; background: #1e1e1e;
        border-radius: 2px; overflow: hidden;
      }
      .eiw-bar-fill {
        height: 100%; border-radius: 2px; width: 0%;
        transition: width 0.9s ease;
      }

      /* Footer */
      .eiw-divider { height: 1px; background: #1e1e1e; margin: 10px 14px 0; }
      .eiw-footer { padding: 8px 14px 11px; }
      .eiw-footer-link {
        display: block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.6rem; font-weight: 700;
        color: #ef4444; text-decoration: none;
        letter-spacing: 0.05em; margin-bottom: 3px;
        transition: color 0.15s;
      }
      .eiw-footer-link:hover { color: #f87171; }
      .eiw-footer-meta {
        display: flex; justify-content: space-between;
        font-size: 0.52rem; color: #2a2a2a; letter-spacing: 0.04em;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Build widget HTML ─────────────────────────────────────────────────────
  function buildWidget(data) {
    const level   = Math.min(5, Math.max(1, parseInt(data.level) || 3));
    const score   = Math.min(10, Math.max(0, parseFloat(data.score) || 6.5));
    const headline = data.headline || 'Current election risk assessment';
    const updated  = data.updated  || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const meta     = LEVELS[level];
    const barPct   = Math.round((score / 10) * 100);

    const levelRows = [5, 4, 3, 2, 1].map(n => {
      const lm  = LEVELS[n];
      const active = n === level ? ' eiw-active' : '';
      return `
        <div class="eiw-level${active}" style="color:${lm.color}">
          <div class="eiw-level-num">${n}</div>
          <div>
            <div class="eiw-level-name">ELECTCON ${n}</div>
            <div class="eiw-level-desc">${lm.label} · ${lm.desc}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="eiw-w">
        <div class="eiw-hdr">
          <div class="eiw-brand"><span class="eiw-brand-red">ELECTCON™</span> · Election Risk</div>
          <div class="eiw-live"><div class="eiw-dot"></div>LIVE</div>
        </div>
        <div class="eiw-score">
          <div class="eiw-score-num" style="color:${meta.color}">${level}</div>
          <div>
            <div class="eiw-score-label" style="color:${meta.color}">ELECTCON ${level} — ${meta.label}</div>
            <div class="eiw-score-erc">ERC Score: ${score.toFixed(1)} / 10</div>
          </div>
        </div>
        <div class="eiw-headline">${headline}</div>
        <div class="eiw-levels">${levelRows}</div>
        <div class="eiw-bar-track">
          <div class="eiw-bar-fill" id="eiw-bar-fill" style="background:${meta.color}"></div>
        </div>
        <div class="eiw-divider"></div>
        <div class="eiw-footer">
          <a class="eiw-footer-link" href="${SITE_URL}" target="_blank">
            ↗ Full EIW Dashboard — americanmuckrakers.com/electcon
          </a>
          <div class="eiw-footer-meta">
            <span>© 2026 American Muckrakers II</span>
            <span>${updated}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Mount ─────────────────────────────────────────────────────────────────
  function mount(data) {
    const target = document.getElementById(TARGET_ID);
    if (!target) { console.warn('ELECTCON widget: no element with id="' + TARGET_ID + '" found.'); return; }
    injectStyles();
    target.innerHTML = buildWidget(data);
    // Animate bar after paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        const bar = document.getElementById('eiw-bar-fill');
        const score = Math.min(10, Math.max(0, parseFloat(data.score) || 6.5));
        if (bar) bar.style.width = Math.round((score / 10) * 100) + '%';
      }, 100);
    });
  }

  // ── Fetch level JSON, fall back to defaults on error ──────────────────────
  function init() {
    fetch(JSON_URL + '?t=' + Date.now())  // cache-bust
      .then(r => r.json())
      .then(data => mount(data))
      .catch(() => {
        // Fallback: render with safe defaults if fetch fails
        mount({ level: 3, score: 6.5, headline: 'Assessment unavailable — visit site for current status.', updated: '—' });
      });
  }

  // ── Run when DOM is ready ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
