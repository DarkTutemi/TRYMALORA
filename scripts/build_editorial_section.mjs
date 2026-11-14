import fs from 'fs';

const raw = fs.readFileSync('scripts/custom_liquid_story.html', 'utf8');

// Find start of <style>
const styleStart = raw.indexOf('<style>\n/* CHRISTMAS LANTERN WELCOME GNOME');
const cottageStart = raw.indexOf('<div id="clg-cottage">');
const finalEnd = raw.indexOf('</section>\n\n</div>\n  </div>\n</div>');

if (styleStart === -1 || cottageStart === -1 || finalEnd === -1) {
  console.log('Offsets:', { styleStart, cottageStart, finalEnd });
  throw new Error('Could not find markers in custom_liquid_story.html');
}

const styleContent = raw.substring(styleStart, cottageStart);
let htmlContent = raw.substring(cottageStart, finalEnd + '</section>\n\n</div>'.length);

// Replace external link with smooth scroll to buy box
htmlContent = htmlContent.replace(
  'href="https://ncrovoprime.com/products/christmas-lantern-welcome-gnome"',
  'href="#zvPdpMain" onclick="document.querySelector(\'#zvPdpMain\')?.scrollIntoView({behavior:\'smooth\'}); return false;"'
);

const sectionLiquid = `{% comment %}
  TRYMALORA - CHRISTMAS LANTERN WELCOME GNOME EDITORIAL STORY
  Full-fidelity 9-part visual storytelling section with scoped #clg-cottage styling.
{% endcomment %}

{% if product.handle == 'christmas-lantern-welcome-gnome' or section.settings.always_show %}
<div class="clg-editorial-wrapper" id="Section-{{ section.id }}">
${styleContent}

${htmlContent}
</div>
{% endif %}

{% schema %}
{
  "name": "Gnome Editorial Story",
  "tag": "section",
  "class": "clg-gnome-editorial-section",
  "settings": [
    {
      "type": "checkbox",
      "id": "always_show",
      "label": "Always Show Section",
      "default": false
    }
  ],
  "presets": [
    {
      "name": "Gnome Editorial Story"
    }
  ]
}
{% endschema %}
`;

fs.writeFileSync('sections/clg-gnome-editorial.liquid', sectionLiquid, 'utf8');
console.log('✔ Created sections/clg-gnome-editorial.liquid! Length:', sectionLiquid.length);

