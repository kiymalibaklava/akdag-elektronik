const fs = require('fs');

async function getIdea() {
  const res = await fetch('https://ideaelektronik.com.tr/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const re = /<img[^>]+src="([^">]+)"[^>]*>/gi;
  let m;
  const list = [];
  while ((m = re.exec(html)) !== null) {
    if (m[1].toLowerCase().includes('brand') || m[1].toLowerCase().includes('marka') || m[1].toLowerCase().includes('logo')) {
      list.push(m[1]);
    }
  }
  console.log('Idea brands:', list);
}
getIdea();
