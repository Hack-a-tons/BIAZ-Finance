import { readFileSync } from 'fs';
import { join } from 'path';

const PROMPTS_DIR = join(__dirname, '../../prompts');

function loadPrompt(filename: string): string {
  const path = join(PROMPTS_DIR, filename);
  return readFileSync(path, 'utf-8').trim();
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return result;
}

export function getPrompt(name: string, vars?: Record<string, string>): string {
  const template = loadPrompt(`${name}.md`);
  return vars ? fillTemplate(template, vars) : template;
}
