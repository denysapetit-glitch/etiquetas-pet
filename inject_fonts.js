const fs = require('fs');
const reg = fs.readFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/inter-regular_b64.txt', 'utf8').trim();
const bold = fs.readFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/inter-bold_b64.txt', 'utf8').trim();

let html = fs.readFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/index.html', 'utf8');

// Check if already injected
if (html.includes('INTER_REGULAR')) {
  console.log('Already injected, skipping.');
  process.exit(0);
}

// Inject after the last icon constant (ICON_CACHORRO)
const anchor = "const ICON_CACHORRO = 'data:image/png;base64,";
const anchorPos = html.indexOf(anchor);
const endPos = html.indexOf("';", anchorPos) + 2;
const injection = "\nconst INTER_REGULAR = '" + reg + "';\nconst INTER_BOLD = '" + bold + "';";

html = html.slice(0, endPos) + injection + html.slice(endPos);
fs.writeFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/index.html', html);
console.log('Done. File size:', html.length, 'chars');
