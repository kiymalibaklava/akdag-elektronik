const fs = require('fs');

async function getSeeklogo() {
  const res = await fetch('https://seeklogo.com/vector-logo/19126/allen-and-heath', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const m = html.match(/src="([^"]*(?:allen|logo)[^"]*)"/i) || html.match(/https:\/\/[^"']*\.png/i);
  console.log('Seeklogo result:', m ? m[0] : 'none');
}
getSeeklogo();
