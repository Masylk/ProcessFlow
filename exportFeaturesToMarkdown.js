const fs = require('fs');
const path = require('path');

// Paths
const FEATURE_DIR = './e2e/features';
const OUTPUT_DIR = './docs/test-cases';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Format Gherkin lines to Markdown
function formatLine(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('Feature:')) {
    return `# ${trimmed.replace('Feature:', '').trim()}\n`;
  } else if (trimmed.startsWith('Scenario:')) {
    return `## ${trimmed}\n`;
  } else if (
    trimmed.startsWith('Given') ||
    trimmed.startsWith('When') ||
    trimmed.startsWith('Then') ||
    trimmed.startsWith('And') ||
    trimmed.startsWith('But')
  ) {
    return `**${trimmed.split(' ')[0]}** ${trimmed.slice(trimmed.indexOf(' ') + 1)}`;
  } else {
    return trimmed;
  }
}

function convertFeatureToMarkdown(featurePath) {
  const fileName = path.basename(featurePath, '.feature');
  const markdownPath = path.join(OUTPUT_DIR, `${fileName}.md`);

  const autoBlockStart = '<!-- AUTO-GENERATED START -->';
  const autoBlockEnd = '<!-- AUTO-GENERATED END -->';

  const lines = fs.readFileSync(featurePath, 'utf-8').split('\n');
  const formatted = lines.map(formatLine).join('\n\n');

  const autoContent = `${autoBlockStart}\n\n${formatted}\n\n${autoBlockEnd}`;

  let existingContent = '';
  if (fs.existsSync(markdownPath)) {
    existingContent = fs.readFileSync(markdownPath, 'utf-8');
  }

  let preservedContent = existingContent.split(autoBlockEnd)[1] || '';
  fs.writeFileSync(markdownPath, `${autoContent}${preservedContent}`, 'utf-8');

  console.log(
    `✅ Converted ${fileName}.feature → ${fileName}.md (preserving manual edits)`
  );
}

// Run on all .feature files
fs.readdirSync(FEATURE_DIR)
  .filter((file) => file.endsWith('.feature'))
  .forEach((file) => convertFeatureToMarkdown(path.join(FEATURE_DIR, file)));
