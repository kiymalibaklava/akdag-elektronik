const fs = require('fs');
const path = require('path');

const brandsDir = path.join(process.cwd(), 'public', 'brands');
if (!fs.existsSync(brandsDir)) fs.mkdirSync(brandsDir, { recursive: true });

async function getLdSystems() {
  try {
    const res = await fetch('https://www.ld-systems.com/en/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    // Look for logo svg or img
    const m = html.match(/<svg[^>]*class="[^"]*logo[^"]*"[^>]*>[\s\S]*?<\/svg>/i) ||
              html.match(/<svg[^>]*>[\s\S]*?ld-systems[\s\S]*?<\/svg>/i) ||
              html.match(/src="([^"]*(?:logo|ld-systems)[^"]*\.svg)"/i);
    console.log('LD Match:', m ? (m[1] || m[0].slice(0, 100)) : 'none');
  } catch (e) {
    console.error('LD error:', e.message);
  }
}

async function getAudac() {
  try {
    const res = await fetch('https://audac.eu/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const m = html.match(/src="([^"]*logo[^"]*\.svg)"/i) || html.match(/<svg[\s\S]*?<\/svg>/i);
    console.log('Audac match:', m ? (m[1] || m[0].slice(0, 100)) : 'none');
  } catch (e) {
    console.error('Audac error:', e.message);
  }
}

async function getAlto() {
  try {
    const res = await fetch('https://www.altoprofessional.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const m = html.match(/src="([^"]*(?:logo|alto)[^"]*\.svg)"/i) || html.match(/<svg[\s\S]*?altoprofessional[\s\S]*?<\/svg>/i);
    console.log('Alto match:', m ? (m[1] || m[0].slice(0, 100)) : 'none');
  } catch (e) {
    console.error('Alto error:', e.message);
  }
}

async function getMartinAudio() {
  try {
    const res = await fetch('https://martin-audio.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const m = html.match(/src="([^"]*logo[^"]*\.svg)"/i) || html.match(/<svg[\s\S]*?martin[\s\S]*?<\/svg>/i);
    console.log('Martin match:', m ? (m[1] || m[0].slice(0, 100)) : 'none');
  } catch (e) {
    console.error('Martin error:', e.message);
  }
}

async function getAllenHeath() {
  try {
    const res = await fetch('https://www.allen-heath.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const m = html.match(/src="([^"]*logo[^"]*\.svg)"/i) || html.match(/<svg[\s\S]*?allen[\s\S]*?<\/svg>/i);
    console.log('Allen match:', m ? (m[1] || m[0].slice(0, 100)) : 'none');
  } catch (e) {
    console.error('Allen error:', e.message);
  }
}

async function run() {
  await getLdSystems();
  await getAudac();
  await getAlto();
  await getMartinAudio();
  await getAllenHeath();
}

run();
