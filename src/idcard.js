// Draws the Champion ID card to a PNG, matching the card on the Champion ID screen.
import { BADGES, LIVE, game } from './data.js';

const EMOJI = "'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif";
const W = 440, PAD = 16, S = 2;

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function spaced(ctx, text, x, y, spacing, align) {
  try { ctx.letterSpacing = spacing + 'px'; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.letterSpacing = '0px'; } catch (e) { ctx.fillText(text, x, y); }
}

function wrap(ctx, text, maxW) {
  const words = text.split(' '), lines = [];
  let cur = '';
  words.forEach((w) => {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}

function loadImage(src) {
  return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
}

export async function renderIdPng({ name, photo, av, rank, count, mine }) {
  try {
    await Promise.all([
      document.fonts.load("800 29px 'Baloo 2'"), document.fonts.load('900 21px Nunito'),
      document.fonts.load('800 13px Nunito'), document.fonts.load('700 11.5px Nunito'),
    ]);
  } catch (e) { /* draw with fallback fonts */ }
  const img = photo && photo !== 'avatar' ? await loadImage(photo) : null;

  const tileW = (W - PAD * 2 - 8 * 3) / 4, tileH = 68, rows = Math.ceil(BADGES.length / 4);
  const headH = 84, idTop = headH + PAD, gridTop = idTop + 96 + 16 + 22;
  const footTop = gridTop + rows * tileH + (rows - 1) * 8 + 14;
  const H = footTop + 10 + 34 + PAD;

  const cv = document.createElement('canvas');
  cv.width = W * S; cv.height = H * S;
  const ctx = cv.getContext('2d');
  ctx.scale(S, S);
  ctx.textBaseline = 'alphabetic';

  // card
  rrect(ctx, 1.5, 1.5, W - 3, H - 3, 24);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.save(); rrect(ctx, 1.5, 1.5, W - 3, H - 3, 24); ctx.clip();
  const g = ctx.createLinearGradient(0, 0, W, headH);
  g.addColorStop(0, '#d9650a'); g.addColorStop(1, '#c62f22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, headH);
  ctx.restore();
  ctx.lineWidth = 3; ctx.strokeStyle = '#f2760c'; rrect(ctx, 1.5, 1.5, W - 3, H - 3, 24); ctx.stroke();

  // header
  ctx.fillStyle = '#fff';
  ctx.font = "800 29px 'Baloo 2',sans-serif";
  spaced(ctx, 'BAYANIHanda', W / 2, 44, 1, 'center');
  ctx.font = '900 11.5px Nunito,sans-serif';
  let chipW;
  try { ctx.letterSpacing = '2.5px'; chipW = ctx.measureText('YOUNG DRRM CHAMPION').width + 20; ctx.letterSpacing = '0px'; } catch (e) { chipW = 200; }
  ctx.fillStyle = 'rgba(0,0,0,.2)'; rrect(ctx, W / 2 - chipW / 2, 52, chipW, 20, 10); ctx.fill();
  ctx.fillStyle = '#fff'; spaced(ctx, 'YOUNG DRRM CHAMPION', W / 2 + 1.25, 66, 2.5, 'center');

  // photo, or the player's avatar
  ctx.save(); rrect(ctx, PAD, idTop, 96, 96, 18); ctx.clip();
  if (img) {
    const sc = Math.max(96 / img.width, 96 / img.height), iw = img.width * sc, ih = img.height * sc;
    ctx.drawImage(img, PAD + (96 - iw) / 2, idTop + (96 - ih) / 2, iw, ih);
  } else {
    ctx.fillStyle = av.bg; ctx.fillRect(PAD, idTop, 96, 96);
    ctx.font = '58px ' + EMOJI; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    ctx.fillText(av.e, PAD + 48, idTop + 70);
  }
  ctx.restore();

  // name and rank
  const fx = PAD + 96 + 14, fw = W - fx - PAD;
  ctx.fillStyle = '#4f6572'; ctx.font = '900 11px Nunito,sans-serif';
  spaced(ctx, 'NAME', fx, idTop + 22, 1, 'left');
  ctx.fillStyle = '#16303f'; ctx.font = '900 21px Nunito,sans-serif'; ctx.textAlign = 'left';
  let nm = name;
  while (ctx.measureText(nm).width > fw - 4 && nm.length > 1) nm = nm.slice(0, -1);
  ctx.fillText(nm === name ? nm : nm + '…', fx + 2, idTop + 50);
  ctx.fillStyle = '#d5e3ea'; ctx.fillRect(fx, idTop + 58, fw, 2);
  ctx.font = '900 13px Nunito,sans-serif';
  const rk = '🏅 ' + rank, rkW = ctx.measureText(rk).width + 24;
  ctx.fillStyle = '#fff5df'; rrect(ctx, fx, idTop + 68, rkW, 24, 12); ctx.fill();
  ctx.fillStyle = '#7a5400'; ctx.fillText(rk, fx + 12, idTop + 85);

  // badges
  ctx.fillStyle = '#4f6572'; ctx.font = '900 11.5px Nunito,sans-serif';
  spaced(ctx, 'BADGES · ' + count + ' OF ' + LIVE.length, PAD, gridTop - 10, 1.5, 'left');
  BADGES.forEach((id, i) => {
    const b = game(id), x = PAD + (i % 4) * (tileW + 8), y = gridTop + Math.floor(i / 4) * (tileH + 8);
    const earned = !b.soon && !!mine[id];
    rrect(ctx, x + 1, y + 1, tileW - 2, tileH - 2, 14);
    if (b.soon) { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#c8d6de'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.fillStyle = earned ? '#eafaf1' : '#f6f9fb'; ctx.fill(); ctx.strokeStyle = earned ? '#7fd8a8' : '#d5e3ea'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.save();
    if (!earned) { ctx.globalAlpha = b.soon ? 0.3 : 0.4; try { ctx.filter = 'grayscale(1)'; } catch (e) { /* older canvas */ } }
    ctx.font = '24px ' + EMOJI; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    ctx.fillText(b.badge[1], x + tileW / 2, y + 32);
    ctx.restore();
    ctx.font = (earned ? '900' : '800') + ' 10.5px Nunito,sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = earned ? '#0c5c3a' : b.soon ? '#5b7280' : '#4f6572';
    const lines = b.soon ? ['Soon'] : wrap(ctx, b.badge[0], tileW - 6).slice(0, 2);
    lines.forEach((l, li) => ctx.fillText(l, x + tileW / 2, y + 48 + li * 11.5));
  });

  // footer
  ctx.fillStyle = '#d5e3ea'; ctx.fillRect(PAD, footTop, W - PAD * 2, 1);
  ctx.fillStyle = '#4f6572'; ctx.font = '700 11.5px Nunito,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('University of the Philippines Resilience Institute', W / 2, footTop + 22);
  ctx.fillText('Awarded for learning to prevent, prepare, respond, and recover.', W / 2, footTop + 38);

  return new Promise((res) => cv.toBlob((b) => res(b), 'image/png'));
}

export function idFileName(name) {
  return 'Champion ID - ' + (name || 'Champion').replace(/[\\/:*?"<>|]/g, '').trim() + '.png';
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function savePng(blob, filename) {
  download(blob, filename);
  return 'saved';
}

// System share sheet where the browser supports sharing files, otherwise a download.
export async function sharePng(blob, filename) {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My BAYANIHanda Champion ID' });
      return 'shared';
    } catch (e) {
      return e && e.name === 'AbortError' ? 'cancelled' : 'failed';
    }
  }
  download(blob, filename);
  return 'saved';
}
