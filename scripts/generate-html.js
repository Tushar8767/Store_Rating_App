const fs = require('fs');

const md = fs.readFileSync('REPORT.md', 'utf8');

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>DevOps Report - Tushar Chaugule</title>\n<style>\n' +
  'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.5; margin: 35px 45px; color: #1d2433; font-size: 10.5pt; }\n' +
  'h1 { font-size: 17pt; color: #1f4e79; border-bottom: 2px solid #1f4e79; padding-bottom: 4px; margin-top: 0; }\n' +
  'h2 { font-size: 13pt; color: #173b5c; border-bottom: 1px solid #d9dde4; padding-bottom: 3px; margin-top: 22px; }\n' +
  'h3 { font-size: 11.5pt; color: #333; margin-top: 14px; }\n' +
  'table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; }\n' +
  'th, td { border: 1px solid #c9d0db; padding: 6px 10px; text-align: left; vertical-align: top; }\n' +
  'th { background-color: #eef2f7; color: #1f4e79; font-weight: 600; }\n' +
  'pre { background: #f4f5f7; border: 1px solid #d9dde4; padding: 10px; border-radius: 4px; font-family: Consolas, monospace; font-size: 8.5pt; overflow-x: auto; }\n' +
  'code { font-family: Consolas, monospace; background: #eef2f7; padding: 1px 4px; border-radius: 3px; font-size: 9pt; }\n' +
  'blockquote { background: #fef8e7; border-left: 4px solid #f59e0b; margin: 12px 0; padding: 8px 12px; font-size: 9.5pt; }\n' +
  '@page { size: A4; margin: 12mm 15mm; }\n' +
  '</style>\n</head>\n<body>\n';

const lines = md.split('\n');
let inPre = false;
let inTable = false;
let preContent = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.startsWith('```')) {
    if (inPre) {
      html += '<pre><code>' + escapeHtml(preContent.join('\n')) + '</code></pre>\n';
      preContent = [];
      inPre = false;
    } else {
      inPre = true;
    }
    continue;
  }

  if (inPre) {
    preContent.push(line);
    continue;
  }

  if (line.startsWith('|')) {
    if (!inTable) {
      inTable = true;
      html += '<table>\n';
    }
    if (line.includes('---')) continue; // skip divider
    const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const tag = i > 0 && lines[i - 1].startsWith('|') && !lines[i - 2]?.startsWith('|') ? 'th' : 'td';
    html += '  <tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>\n';
    continue;
  } else if (inTable) {
    inTable = false;
    html += '</table>\n';
  }

  if (line.startsWith('### ')) {
    html += `<h3>${line.substring(4)}</h3>\n`;
  } else if (line.startsWith('## ')) {
    html += `<h2>${line.substring(3)}</h2>\n`;
  } else if (line.startsWith('# ')) {
    html += `<h1>${line.substring(2)}</h1>\n`;
  } else if (line.startsWith('> ')) {
    html += `<blockquote>${line.substring(2)}</blockquote>\n`;
  } else if (line.startsWith('- ')) {
    html += `<li>${line.substring(2)}</li>\n`;
  } else if (line.trim() === '---') {
    html += '<hr style="border:0; border-top: 1px solid #d9dde4; margin: 18px 0;">\n';
  } else if (line.trim().length > 0) {
    let p = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    html += `<p>${p}</p>\n`;
  }
}

if (inTable) html += '</table>\n';
html += '</body>\n</html>';

fs.writeFileSync('REPORT.html', html, 'utf8');
console.log('Successfully written REPORT.html');
