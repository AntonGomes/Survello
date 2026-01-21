/* eslint-disable */
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/client');
let total = 0;

function addNoCheck(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addNoCheck(filePath);
    } else if (file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.startsWith('// @ts-nocheck')) {
        fs.writeFileSync(filePath, '// @ts-nocheck\n' + content);
	total += 1;
      }
    }
  }
}

console.log('Suppressing TypeScript errors in generated client...');
addNoCheck(targetDir);
console.log(`Added @ts-nocheck to ${total} files.`);
