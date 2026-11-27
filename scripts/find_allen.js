const fs = require('fs');
const path = require('path');

async function getAllen() {
  const res = await fetch('https://www.allen-heath.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const m = html.match(/<header[\s\S]*?<\/header>/i);
  if (m) {
    console.log('Header snippet:', m[0].slice(0, 800));
  } else {
    console.log('No header tag');
  }
}
getAllen();
