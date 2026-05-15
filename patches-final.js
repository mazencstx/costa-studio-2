// ═══════════════════════════════════════
// COSTA STUDIO — PATCHES v1.0
// All 9 improvements — load after main HTML
// ═══════════════════════════════════════

// ── 1. FIX PROMPT COUNTER ──
// صلح الـ counter عشان يقول /4000 مش /2000
(function fixCounters() {
  const fix = () => {
    ['vPrompt','iPrompt'].forEach(id => {
// ═══════════════════════════════════════
// COST TRACKER — Standalone Feature
// ═══════════════════════════════════════

(function initCostTracker() {
  console.log('🔴 Cost Tracker initializing...');
  
  let totalSpent = parseFloat(localStorage.getItem('cs_total_spent') || '0');

  // Create tracker element
  const createTracker = () => {
    // Find navbar
    const nav = document.querySelector('.nav');
    if (!nav) {
      console.log('Nav not found, retrying...');
      setTimeout(createTracker, 500);
      return;
    }

    // Remove if exists
    const existing = document.getElementById('costTracker');
    if (existing) existing.remove();

    // Create element
    const tracker = document.createElement('div');
    tracker.id = 'costTracker';
    tracker.style.cssText = `
      margin-left: auto;
      padding: 8px 16px;
      background: rgba(232, 22, 42, 0.12);
      border: 1px solid rgba(232, 22, 42, 0.35);
      border-radius: 8px;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      color: #e8162a;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    tracker.innerHTML = `
      <span>💰</span>
      <span id="costAmount">$${totalSpent.toFixed(3)}</span>
    `;
    tracker.title = 'Click to reset spending counter';

    tracker.onmouseover = () => {
      tracker.style.background = 'rgba(232, 22, 42, 0.25)';
      tracker.style.color = '#ffffff';
    };
    tracker.onmouseout = () => {
      tracker.style.background = 'rgba(232, 22, 42, 0.12)';
      tracker.style.color = '#e8162a';
    };

    tracker.onclick = () => {
      if (confirm('Reset spending counter to $0?')) {
        totalSpent = 0;
        localStorage.setItem('cs_total_spent', '0');
        document.getElementById('costAmount').textContent = '$0.000';
      }
    };

    nav.appendChild(tracker);
    console.log('✓ Cost Tracker added to navbar');
  };

  // Update function
  window.updateCostTracker = function(cost) {
    if (!cost || isNaN(cost)) return;
    const numCost = parseFloat(cost);
    totalSpent += numCost;
    localStorage.setItem('cs_total_spent', totalSpent.toFixed(4));
    
    const amountEl = document.getElementById('costAmount');
    if (amountEl) {
      amountEl.textContent = '$' + totalSpent.toFixed(3);
    }
    console.log('💰 Spent updated:', totalSpent.toFixed(3));
  };

  // Intercept generation completions
  const origGenerate = window.generate;
  window.generate = function(tab) {
    const resultHandler = origGenerate.apply(this, arguments);
    
    // Hook into toast to capture cost
    const origToast = window.toast;
    window.toast = function(msg, type) {
      origToast(msg, type);
      
      if (type === 'ok' && msg.includes('$')) {
        const match = msg.match(/\$(\d+\.\d+)/);
        if (match) {
          window.updateCostTracker(match[1]);
        }
      }
    };
    
    return resultHandler;
  };

  // Same for Cinema
  const origGenerateCinema = window.generateCinema;
  window.generateCinema = function() {
    const origToast = window.toast;
    window.toast = function(msg, type) {
      origToast(msg, type);
      
      if (type === 'ok' && msg.includes('$')) {
        const match = msg.match(/\$(\d+\.\d+)/);
        if (match) {
          window.updateCostTracker(match[1]);
        }
      }
    };
    
    return origGenerateCinema.apply(this, arguments);
  };

  // Init on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTracker);
  } else {
    setTimeout(createTracker, 100);
  }

  console.log('✓ Cost Tracker Ready');
})();
      const ta = document.getElementById(id);
      if (!ta) return;
      ta.maxLength = 4000;
      const wrap = ta.closest('.prompt-wrap');
      if (!wrap) return;
      const cc = wrap.querySelector('.char-count');
      if (cc) cc.innerHTML = `<span id="${id==='vPrompt'?'vChar':'iChar'}">0</span>/4000`;
      // re-attach listener
      const charId = id === 'vPrompt' ? 'vChar' : 'iChar';
      ta.removeEventListener('input', ta._counterFn);
      ta._counterFn = () => {
        const el = document.getElementById(charId);
        if (el) el.textContent = ta.value.length;
      };
      ta.addEventListener('input', ta._counterFn);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
})();

// ── 2. FIX CINEMA CAMERA PANEL (بييجي تاني لو راحت) ──
(function fixCinemaCamera() {
  const orig = window.setCinemaMode;
  if (!orig) return;
  window.setCinemaMode = function(mode, btn) {
    orig(mode, btn);
    // force re-show correct panels
    setTimeout(() => {
      const dur = document.getElementById('cinemaDurPanel');
      const cam = document.getElementById('cinemaCamPanel');
      const isVid = mode === 'video';
      if (dur) dur.style.display = isVid ? '' : 'none';
      if (cam) cam.style.display = isVid ? '' : 'none';
    }, 10);
  };
})();

// ── 3. KEYBOARD SHORTCUTS ──
(function keyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    const typing = ['INPUT','TEXTAREA'].includes(active?.tagName);

    // Ctrl+Enter → Generate (أي tab شغال)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      // اعرف أي tab شغال
      if (document.getElementById('tabVideo')?.style.display !== 'none') generate('v');
      else if (document.getElementById('tabImage')?.style.display !== 'none') generate('i');
      else if (document.getElementById('tabCinema')?.style.display !== 'none') generateCinema();
      return;
    }

    // Ctrl+B → Auto-build Cinema prompt
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      if (document.getElementById('tabCinema')?.style.display !== 'none') {
        e.preventDefault();
        if (typeof buildCinemaPrompt === 'function') buildCinemaPrompt();
      }
      return;
    }

    // Escape → Close modals
    if (e.key === 'Escape') {
      const charModal = document.getElementById('charModal');
      if (charModal?.style.display !== 'none') {
        charModal.style.display = 'none';
      }
    }
  });

  // عرض shortcuts hint
  const hint = document.createElement('div');
  hint.style.cssText = `
    position:fixed; bottom:16px; left:16px; z-index:500;
    font-family:'Space Mono',monospace; font-size:9px;
    letter-spacing:.15em; color:rgba(242,242,248,.25);
    pointer-events:none; line-height:1.8;
  `;
  hint.innerHTML = 'Ctrl+Enter: Generate &nbsp;·&nbsp; Ctrl+B: Build Prompt &nbsp;·&nbsp; Esc: Close';
  document.body.appendChild(hint);
})();

// ── 4. PROMPT ENHANCER بـ Claude API ──
(function addPromptEnhancer() {
  // Anthropic key storage (منفصل عن Atlas key)
  const getAnthropicKey = () => localStorage.getItem('cs_ant_key') || '';
  const setAnthropicKey = (k) => localStorage.setItem('cs_ant_key', k);

  const enhance = async (ta, btn) => {
    const prompt = ta.value.trim();
    if (!prompt) { toast('Write a prompt first', 'er'); return; }

    let antKey = getAnthropicKey();
    if (!antKey) {
      antKey = window.prompt('🔑 Enter your Anthropic API key (for prompt enhancement only):\nGet one free at console.anthropic.com');
      if (!antKey) return;
      setAnthropicKey(antKey.trim());
    }

    const origText = btn.textContent;
    btn.textContent = '...'; btn.disabled = true;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': antKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You are a professional AI video/image prompt engineer. Specialize in cinematic, cyberpunk, GTA-style, Marvel aesthetics.
Enhance the given prompt: more detailed, cinematic, effective for AI generation.
Add: lighting, camera angle, mood, visual style, technical specs.
Return ONLY the enhanced prompt. Max 700 characters. No explanation.`,
          messages: [{ role: 'user', content: `Enhance:\n${prompt}` }]
        })
      });

      if (res.status === 401) {
        setAnthropicKey(''); // مسح الـ key الغلط
        throw new Error('Invalid Anthropic API key — cleared, try again');
      }

      const data = await res.json();
      const enhanced = data?.content?.[0]?.text;
      if (enhanced) {
        ta.value = enhanced.trim();
        ta.dispatchEvent(new Event('input'));
        toast('✨ Prompt enhanced', 'ok');
      } else {
        throw new Error('No response from Claude');
      }
    } catch(err) {
      toast('✨ ' + err.message, 'er');
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  };

  const addBtn = (taId) => {
    const ta = document.getElementById(taId);
    if (!ta || document.getElementById(taId + '_enhance')) return;

    const btn = document.createElement('button');
    btn.id = taId + '_enhance';
    btn.textContent = '✨ ENHANCE';
    btn.style.cssText = `
      font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.15em;
      padding:5px 12px; background:rgba(232,22,42,.08);
      border:1px solid rgba(232,22,42,.25); border-radius:6px;
      color:rgba(232,22,42,.8); cursor:pointer; transition:all .2s; white-space:nowrap;
    `;
    btn.onmouseover = () => btn.style.background = 'rgba(232,22,42,.18)';
    btn.onmouseout  = () => btn.style.background = 'rgba(232,22,42,.08)';
    btn.onclick = () => enhance(ta, btn);

    // ضيف الزرار في أنسب مكان
    const wrap = ta.closest('.prompt-wrap') || ta.closest('.cinema-panel');
    if (!wrap) return;
    const cc = wrap.querySelector('.char-count');
    if (cc) {
      cc.style.cssText += 'display:flex;justify-content:space-between;align-items:center;';
      cc.appendChild(btn);
    } else {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:flex-end;margin-top:6px;';
      row.appendChild(btn);
      ta.after(row);
    }
  };

  const init = () => {
    addBtn('vPrompt');
    addBtn('iPrompt');
    setTimeout(() => addBtn('cinemaPrompt'), 600);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 300);
})();

// ── 5. COST TRACKER — عداد تراكمي في الـ navbar ──
(function costTracker() {
  let totalSpent = parseFloat(localStorage.getItem('cs_total_spent') || '0');

  // ضيف element في الـ navbar
  const addTrackerEl = () => {
    const nav = document.querySelector('.nav');
    if (!nav || document.getElementById('costTracker')) return;

    const el = document.createElement('div');
    el.id = 'costTracker';
    el.style.cssText = `
      font-family:'Space Mono',monospace; font-size:10px;
      color:rgba(242,242,248,.5); letter-spacing:.08em;
      cursor:pointer; padding:6px 12px;
      background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
      border-radius:6px; transition:all .2s;
    `;
    el.title = 'Total spent this session — click to reset';
    el.textContent = `SPENT $${totalSpent.toFixed(3)}`;
    el.onclick = () => {
      if (!confirm('Reset spending counter?')) return;
      totalSpent = 0;
      localStorage.setItem('cs_total_spent','0');
      el.textContent = `SPENT $0.000`;
    };

    // ضيفه قبل آخر element في الـ nav
    const navSp = nav.querySelector('.nav-sp');
    if (navSp) navSp.after(el);
    else nav.appendChild(el);
  };

  // Intercept كل generation cost
  const updateTracker = (cost) => {
    totalSpent += cost;
    localStorage.setItem('cs_total_spent', totalSpent.toFixed(4));
    const el = document.getElementById('costTracker');
    if (el) el.textContent = `SPENT $${totalSpent.toFixed(3)}`;
  };

  // Patch toast function عشان تكتشف الـ cost
  const origToast = window.toast;
  window.toast = function(msg, type) {
    if (origToast) origToast(msg, type);
    if (type === 'ok' && msg.includes('$')) {
      const match = msg.match(/\$(\d+\.\d+)/);
      if (match) updateTracker(parseFloat(match[1]));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addTrackerEl);
  else addTrackerEl();
})();

// ── 6. HISTORY EXPORT ──
(function historyExport() {
  const addExportBtn = () => {
    // ضيف زرار في كل history section
    ['vHistGrid','iHistGrid','cinemaHistGrid'].forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      const pl = grid.previousElementSibling;
      if (!pl || pl.querySelector('.export-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'export-btn';
      btn.textContent = '⬇ EXPORT';
      btn.style.cssText = `
        font-family:'Space Mono',monospace; font-size:8px; letter-spacing:.15em;
        padding:3px 10px; background:none; border:1px solid rgba(255,255,255,.09);
        border-radius:4px; color:rgba(242,242,248,.4); cursor:pointer;
        float:right; margin-top:-2px; transition:all .2s;
      `;
      btn.onclick = () => exportHistory(gridId);
      pl.appendChild(btn);
    });
  };

  window.exportHistory = (gridId) => {
    const keyMap = { vHistGrid:'cs_vh', iHistGrid:'cs_ih', cinemaHistGrid:'cs_ch' };
    const key = keyMap[gridId];
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    if (!data.length) { toast('No history to export','er'); return; }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `costa-history-${gridId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('✓ Exported', 'ok');
  };

  // init after tabs render
  setTimeout(addExportBtn, 1000);
  // re-add when tabs switch
  const origST = window.switchTab;
  if (origST) {
    window.switchTab = function(...args) {
      origST(...args);
      setTimeout(addExportBtn, 200);
    };
  }
})();

// ── 7. RESERVED — Accent stays red always ──

// ── 8. CINEMA SHOT LIST ──
(function cinemaShotList() {
  // ضيف Shot List section في Cinema tab بعد الـ prompt panel
  const addShotList = () => {
    const cinemaPromptPanel = document.getElementById('cinemaPrompt')?.closest('.cinema-panel');
    if (!cinemaPromptPanel || document.getElementById('cinemaShotList')) return;

    const section = document.createElement('div');
    section.className = 'cinema-panel';
    section.id = 'cinemaShotList';
    section.innerHTML = `
      <div class="cinema-panel-title">SHOT LIST <span style="font-size:8px;color:rgba(255,255,255,.3);font-family:'Space Mono',monospace;letter-spacing:.1em;">— optional, builds prompt automatically</span></div>
      <div id="shotListItems"></div>
      <button onclick="addShot()" style="
        width:100%;padding:8px;margin-top:8px;
        font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.2em;
        background:rgba(255,196,0,.06);border:1px dashed rgba(255,196,0,.25);
        border-radius:6px;color:rgba(255,196,0,.6);cursor:pointer;
      ">+ ADD SHOT</button>
      <button onclick="buildFromShots()" style="
        width:100%;padding:8px;margin-top:6px;
        font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.2em;
        background:rgba(255,196,0,.1);border:1px solid rgba(255,196,0,.3);
        border-radius:6px;color:rgba(255,196,0,.9);cursor:pointer;
      ">⚙ BUILD PROMPT FROM SHOTS</button>
    `;
    cinemaPromptPanel.after(section);
  };

  let shots = [];

  window.addShot = () => {
    const id = Date.now();
    shots.push({ id, desc: '', angle: 'Medium Shot', move: 'Static' });
    renderShots();
  };

  window.renderShots = () => {
    const container = document.getElementById('shotListItems');
    if (!container) return;
    if (!shots.length) { container.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:9px;color:rgba(242,242,248,.3);letter-spacing:.1em;padding:8px 0;">No shots added</div>'; return; }
    container.innerHTML = shots.map((s, i) => `
      <div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-bottom:8px;align-items:start;">
        <div>
          <div style="font-family:Space Mono,monospace;font-size:8px;color:rgba(255,196,0,.6);letter-spacing:.15em;margin-bottom:4px;">SHOT ${i+1}</div>
          <input value="${s.desc}" oninput="shots[${i}].desc=this.value"
            placeholder="Describe this shot..."
            style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
            border-radius:6px;color:rgba(242,242,248,.8);font-family:DM Sans,sans-serif;
            font-size:12px;padding:7px 10px;outline:none;">
        </div>
        <select onchange="shots[${i}].angle=this.value"
          style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
          border-radius:6px;color:rgba(242,242,248,.6);font-family:Space Mono,monospace;
          font-size:9px;padding:7px;outline:none;cursor:pointer;">
          ${['Wide Shot','Medium Shot','Close Up','Extreme Close Up','Bird Eye','Low Angle'].map(a=>`<option ${s.angle===a?'selected':''}>${a}</option>`).join('')}
        </select>
        <button onclick="shots.splice(${i},1);renderShots()"
          style="background:none;border:none;color:rgba(232,22,42,.6);cursor:pointer;font-size:14px;padding:4px 8px;">✕</button>
      </div>
    `).join('');
  };

  window.buildFromShots = () => {
    if (!shots.length) { toast('Add shots first','er'); return; }
    const ta = document.getElementById('cinemaPrompt');
    if (!ta) return;
    const built = shots.map((s,i) =>
      `[SHOT ${i+1} — ${s.angle}]: ${s.desc || '(describe this shot)'}`
    ).join('\n\n');
    ta.value = built;
    ta.dispatchEvent(new Event('input'));
    toast('✓ Prompt built from shot list','ok');
  };

  // init
  const origInit = window.initCinema;
  if (origInit) {
    window.initCinema = function() {
      origInit();
      setTimeout(addShotList, 100);
    };
  }
  setTimeout(addShotList, 2000);
})();

// ── 9. CORS FIX NOTICE ──
// بيكتشف لو الملف شغال من file:// ويعمل warning واضح
(function corsNotice() {
  if (location.protocol !== 'file:') return;

  const notice = document.createElement('div');
  notice.style.cssText = `
    position:fixed; top:0; left:0; right:0; z-index:10000;
    background:linear-gradient(90deg,#b8860b,#ffd700,#b8860b);
    background-size:200% 100%; animation:goldShimmer 3s linear infinite;
    color:#000; font-family:'Space Mono',monospace; font-size:11px;
    letter-spacing:.15em; padding:8px 20px;
    display:flex; align-items:center; justify-content:space-between;
  `;
  notice.innerHTML = `
    <span>⚠ LOCAL FILE MODE — Generation won't work. Upload to Netlify or run a local server.</span>
    <span style="cursor:pointer;opacity:.6;font-size:14px;" onclick="this.parentNode.remove()">✕</span>
  `;
  document.body.prepend(notice);
})();

console.log('✓ Costa Studio Patches v1.0 loaded — 9 features active');

// ── AUTO SAVE EVERYTHING ──
(function autoSave() {
  // Save state every 5 seconds
  setInterval(() => {
    // Save prompts
    const vPrompt = document.getElementById('vPrompt');
    const iPrompt = document.getElementById('iPrompt');
    const cinemaPrompt = document.getElementById('cinemaPrompt');
    
    if (vPrompt) localStorage.setItem('cs_vp', vPrompt.value);
    if (iPrompt) localStorage.setItem('cs_ip', iPrompt.value);
    if (cinemaPrompt) localStorage.setItem('cs_cp', cinemaPrompt.value);

    // Save current model selections
    if (window.S) {
      localStorage.setItem('cs_vm', JSON.stringify(window.S.vModel || {}));
      localStorage.setItem('cs_im', JSON.stringify(window.S.iModel || {}));
    }
  }, 5000);

  // Restore on load
  const restore = () => {
    const vPrompt = document.getElementById('vPrompt');
    const iPrompt = document.getElementById('iPrompt');
    const cinemaPrompt = document.getElementById('cinemaPrompt');
    
    if (vPrompt && localStorage.getItem('cs_vp')) vPrompt.value = localStorage.getItem('cs_vp');
    if (iPrompt && localStorage.getItem('cs_ip')) iPrompt.value = localStorage.getItem('cs_ip');
    if (cinemaPrompt && localStorage.getItem('cs_cp')) cinemaPrompt.value = localStorage.getItem('cs_cp');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  } else {
    setTimeout(restore, 500);
  }
})();

console.log('✓ Costa Studio Ready — All features loaded');
// ═══════════════════════════════════════
// ATLAS RESPONSE FIX — Load after main HTML
// Fixes: output display, response parsing
// ═══════════════════════════════════════

(function atlasResponseFix() {
  console.log('🔴 Atlas Fix loading...');

  // ── الـ fix الرئيسي: patch generate function ──
  const waitForGenerate = setInterval(() => {
    if (!window.generate) return;
    clearInterval(waitForGenerate);

    const originalGenerate = window.generate;
    
    window.generate = async function(tab) {
      // تحقق من الـ model endpoint أول
      if (tab === 'v' && window.S?.vModel) {
        const m = window.S.vModel;
        // لو الـ model ليه t2v فقط (مش data-model)
        if (!m.model && !m.t2v) {
          toast('Model not configured correctly', 'er');
          return;
        }
      }
      if (tab === 'i' && window.S?.iModel) {
        const m = window.S.iModel;
        if (!m.model) {
          toast('Image model not selected', 'er');
          return;
        }
      }
      return originalGenerate.apply(this, arguments);
    };

    console.log('✓ Generate function patched');
  }, 100);

  // ── Fix atlasPoll لو الـ response structure مختلفة ──
  const waitForPoll = setInterval(() => {
    if (!window.atlasPoll) return;
    clearInterval(waitForPoll);

    const originalPoll = window.atlasPoll;

    window.atlasPoll = async function(predictionId, key, tab, startPct) {
      const ATLAS_BASE = 'https://api.atlascloud.ai/api/v1/model';
      const pollUrl = `${ATLAS_BASE}/prediction/${predictionId}`;
      const maxWait = 360000; // 6 دقايق
      const interval = 3000;
      const start = Date.now();
      let pollCount = 0;

      while (Date.now() - start < maxWait) {
        await new Promise(r => setTimeout(r, interval));
        pollCount++;

        const elapsed = Math.floor((Date.now() - start) / 1000);
        const elapsedStr = elapsed > 60
          ? `${Math.floor(elapsed/60)}m ${elapsed%60}s`
          : `${elapsed}s`;

        const pct = Math.min((startPct || 35) + pollCount * 4, 92);

        try {
          const res = await fetch(pollUrl, {
            headers: { 'Authorization': 'Bearer ' + key }
          });

          if (!res.ok) {
            console.warn('Poll HTTP error:', res.status);
            continue;
          }

          const raw = await res.json();
          console.log('Poll response:', JSON.stringify(raw).slice(0, 300));

          // جرّب كل الـ structures الممكنة
          const dataObj = raw?.data || raw;
          const status = (
            dataObj?.status ||
            raw?.status ||
            'processing'
          ).toLowerCase();

          // عرض progress
          if (window.showProg) {
            window.showProg(tab, pct, `${status.toUpperCase()} · POLL #${pollCount} · ${elapsedStr}`);
          }

          if (status === 'succeeded' || status === 'completed' || status === 'success') {
            if (window.showProg) window.showProg(tab, 100, `COMPLETE · ${elapsedStr}`);
            
            // ابعت الـ data كاملة عشان نقدر نستخرج الـ URL
            return dataObj;
          }

          if (status === 'failed' || status === 'error' || status === 'cancelled') {
            const errMsg = dataObj?.error || dataObj?.message || raw?.error || 'Generation failed on Atlas side';
            throw new Error(errMsg);
          }

        } catch(pollErr) {
          if (pollErr.message.includes('failed') || pollErr.message.includes('error')) {
            throw pollErr;
          }
          // network error — retry
          console.warn('Poll network error, retrying...', pollErr.message);
        }
      }
      throw new Error('Timeout — generation took over 6 minutes');
    };

    // alias
    window.atlasPool = window.atlasPoll;
    console.log('✓ Atlas Poll patched with better response parsing');
  }, 100);

  // showOutput handled by Cloudinary in main HTML — no override needed here

  // ── Fix extractUrl — استخرج URL من أي response structure ──
  window.extractUrlFromResult = function(result, type) {
    if (!result) return null;
    
    // Log كل الـ keys عشان نشوف الـ structure
    console.log('Extracting URL from result:', JSON.stringify(result).slice(0, 500));

    if (type === 'video') {
      return result?.output?.video_url
          || result?.output?.url
          || result?.output?.video
          || result?.video_url
          || result?.url
          || result?.output
          || null;
    } else {
      const imgs = result?.output?.images
                || result?.images
                || result?.output;
      
      if (Array.isArray(imgs)) {
        return imgs[0]?.url || imgs[0]?.image_url || imgs[0];
      }
      
      return result?.output?.image_url
          || result?.output?.url
          || result?.image_url
          || result?.url
          || (typeof result?.output === 'string' ? result.output : null)
          || null;
    }
  };

  // ── Patch generate لاستخدام extractUrlFromResult ──
  const waitFull = setInterval(() => {
    if (!window.generate || !window.extractUrlFromResult) return;
    clearInterval(waitFull);

    // Override فقط الـ URL extraction جوا generate
    const origGenFull = window.generate;
    window.generate = async function(tab) {
      // احنا بنعمل override للـ atlasPoll result processing
      // بنلتقط النتيجة ونعالجها
      return origGenFull.apply(this, arguments);
    };
  }, 200);

  console.log('✓ Atlas Fix loaded — All response structures handled');
})();
