const fs = require('fs');
const path = require('path');

const brandsDir = path.join(process.cwd(), 'public', 'brands');

async function checkMartin() {
  const r = await fetch('https://static.martin-audio.com/img/branding/martin-audio-logo-unit-white.svg');
  if (r.ok) {
    const text = await r.text();
    fs.writeFileSync(path.join(brandsDir, 'martin-audio.svg'), text);
    console.log('Saved martin-audio.svg, length:', text.length);
  }
}

async function checkLd() {
  const res = await fetch('https://www.ld-systems.com/en/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const idx = html.indexOf('class="text-(--app-header-logo-color)');
  if (idx !== -1) {
    const start = html.lastIndexOf('<svg', idx);
    const end = html.indexOf('</svg>', idx) + 6;
    const svg = html.slice(start, end);
    fs.writeFileSync(path.join(brandsDir, 'ld-systems-mark.svg'), svg);
    console.log('Saved ld-systems-mark.svg, length:', svg.length);
  }
}

async function checkAlto() {
  const res = await fetch('https://www.altoprofessional.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const imgs = html.match(/<img[^>]+>/gi) || [];
  console.log('Alto images count:', imgs.length);
  for (const img of imgs) {
    if (img.includes('logo') || img.includes('alto')) {
      console.log('Alto logo img:', img);
    }
  }
}

async function checkAudac() {
  const res = await fetch('https://audac.eu/eu/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const imgs = html.match(/<img[^>]+>/gi) || [];
  for (const img of imgs) {
    if (img.includes('logo') || img.includes('audac')) {
      console.log('Audac logo img:', img);
    }
  }
}

async function checkAllen() {
  const res = await fetch('https://www.allen-heath.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const imgs = html.match(/<img[^>]+>/gi) || [];
  for (const img of imgs) {
    if (img.includes('logo') || img.includes('allen')) {
      console.log('Allen logo img:', img);
    }
  }
}

async function run() {
  await checkMartin();
  await checkLd();
  await checkAlto();
  await checkAudac();
  await checkAllen();
}
run();
