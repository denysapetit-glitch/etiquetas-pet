const fs = require('fs');
let html = fs.readFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/index.html', 'utf8');
const count = (html.match(/'Inter'/g) || []).length;
html = html.split("'Inter'").join("'helvetica'");
fs.writeFileSync('C:/Users/ApetitPet/Videos/Geraretiqueta/index.html', html);
console.log('Replaced', count, 'occurrences');
