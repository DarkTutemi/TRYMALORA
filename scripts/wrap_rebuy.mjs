import fs from 'fs';

let content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');

// Find all <script ... type="text/template"> blocks and wrap with {% raw %}...{% endraw %}
content = content.replace(/(<script[^>]+type="text\/template"[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, open, body, close) => {
  // If already wrapped, avoid double wrap
  if (body.includes('{% raw %}')) return match;
  return `${open}\n{% raw %}\n${body}\n{% endraw %}\n${close}`;
});

fs.writeFileSync('sections/malora-footer.liquid', content);
console.log('Successfully wrapped all template scripts with {% raw %} in malora-footer.liquid');
