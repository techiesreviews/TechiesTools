import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const repo = process.cwd();
const output = `${repo}/evidence/ten-video-sections`;
const references = JSON.parse(await readFile(`${output}/references.json`, 'utf8')).references;
const { getPatternDefinition } = await import(pathToFileURL(`${repo}/src/patterns/registry.ts`));
const { compilePattern, defaultPatternState, setPatternStateControl } = await import(pathToFileURL(`${repo}/src/patterns/engine.ts`));
const { buttonComponentCss } = await import(pathToFileURL(`${repo}/src/framework/component-catalog/index.ts`));
const tokens = await readFile(`${repo}/src/styles/tokens.css`, 'utf8');
const results = { sections: {}, failures: [] };
for (const { id } of references) {
  const definition = getPatternDefinition(id);
  assert(definition, id);
  const compiled = compilePattern(definition);
  const css = `${tokens}\n${buttonComponentCss}\n${compiled.css}`;
  const declared = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  const unknown = [...new Set([...css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map(m => m[1]))].filter(name => !declared.has(name));
  if (unknown.length) results.failures.push(`${id}: unresolved tokens ${unknown.join(', ')}`);
  const ineffectiveControls = [];
  for (const control of definition.controls) {
    const defaultState = defaultPatternState(definition);
    const signatures = control.options.map(option => {
      const result = compilePattern(definition, setPatternStateControl(definition, defaultState, control.id, option.id));
      return `${result.html}\n${result.css}`;
    });
    if (new Set(signatures).size !== control.options.length) ineffectiveControls.push(control.id);
    for (const option of control.options) {
      for (const declaration of option.declarations ?? []) {
        if (declaration.property.startsWith('--') && !compiled.css.includes(`var(${declaration.property}`)) ineffectiveControls.push(`${control.id}/${declaration.property} unused`);
      }
    }
    if (control.attribute && !compiled.css.includes(`[${control.attribute}`)) ineffectiveControls.push(`${control.id}/${control.attribute} unused`);
  }
  if (ineffectiveControls.length) results.failures.push(`${id}: controls ${ineffectiveControls.join(', ')}`);
  if (/<main\b/.test(compiled.html)) results.failures.push(`${id}: nested main landmark`);
  if (/<(?:script|iframe)\b|\son\w+=/.test(compiled.html)) results.failures.push(`${id}: runtime script content`);
  const links = [...compiled.html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  const images = [...compiled.html.matchAll(/src="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
  for (const link of links.filter(link => link.startsWith('#'))) {
    if (!compiled.html.includes(`id="${link.slice(1)}"`)) results.failures.push(`${id}: unresolved fragment ${link}`);
  }
  results.sections[id] = { unknown, ineffectiveControls, links, images, cssBytes: compiled.css.length, htmlBytes: compiled.html.length };
}
await writeFile(`${output}/source-results.json`, JSON.stringify(results, null, 2));
assert.deepEqual(results.failures, []);
console.log('All ten source contracts passed.');
