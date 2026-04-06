const fs = require('fs');
const folder = 'C:/Users/ApetitPet/Videos/Geraretiqueta';

const reg  = fs.readFileSync(folder + '/fredoka-regular_b64.txt', 'utf8').trim();
const bold = fs.readFileSync(folder + '/fredoka-bold_b64.txt', 'utf8').trim();

let html = fs.readFileSync(folder + '/index.html', 'utf8');

// Remove old INTER constants if present
html = html.replace(/\nconst INTER_REGULAR = '[^']*';/g, '');
html = html.replace(/\nconst INTER_BOLD = '[^']*';/g, '');
// Remove old Fredoka constants if already injected
html = html.replace(/\nconst FREDOKA_REGULAR = '[^']*';/g, '');
html = html.replace(/\nconst FREDOKA_BOLD = '[^']*';/g, '');

// Inject after ICON_CACHORRO constant
const anchor = "const ICON_CACHORRO = 'data:image/png;base64,";
const anchorPos = html.indexOf(anchor);
const endPos = html.indexOf("';", anchorPos) + 2;
const injection = "\nconst FREDOKA_REGULAR = '" + reg + "';\nconst FREDOKA_BOLD = '" + bold + "';";
html = html.slice(0, endPos) + injection + html.slice(endPos);

fs.writeFileSync(folder + '/index.html', html);
console.log('Done. Size:', html.length);
