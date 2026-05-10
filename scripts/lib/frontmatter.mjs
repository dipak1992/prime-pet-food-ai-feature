export function parseFrontmatter(source, filePath = 'unknown') {
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) {
    throw new Error(`${filePath}: missing frontmatter block`);
  }

  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filePath}: frontmatter block is not closed`);

  return {
    data: parseYamlLite(match[1], filePath),
    body: match[2].trim(),
  };
}

function parseYamlLite(yaml, filePath) {
  const data = {};
  const lines = yaml.split(/\r?\n/);
  let currentArrayKey = null;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = raw.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const arrayItem = line.match(/^\s*-\s+(.*)$/);
    if (arrayItem && currentArrayKey) {
      data[currentArrayKey].push(parseScalar(arrayItem[1]));
      continue;
    }

    currentArrayKey = null;
    const pair = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!pair) {
      throw new Error(`${filePath}: unsupported frontmatter line ${index + 1}: ${raw}`);
    }

    const key = pair[1];
    const value = pair[2] ?? '';
    if (value === '') {
      data[key] = [];
      currentArrayKey = key;
    } else {
      data[key] = parseScalar(value);
    }
  }

  return data;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter((item) => item !== '');
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

