'use strict';

const fs = require('fs');
const path = require('path');

const outFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const defaults = {
  appName: 'BelezaPro',
  apiUrl: '',
};

const fromEnv = [
  { envVar: 'APP_NAME', key: 'appName' },
  { envVar: 'API_URL', key: 'apiUrl' },
];

function resolveEnvironment() {
  const env = {
    production: true,
    appName: defaults.appName,
    apiUrl: defaults.apiUrl,
  };

  for (const { envVar, key } of fromEnv) {
    const value = process.env[envVar];
    if (value !== undefined && value !== '') {
      env[key] = value;
    }
  }

  return env;
}

function toTypeScript(env) {
  return [
    'export const environment = {',
    `  production: ${JSON.stringify(env.production)},`,
    `  appName: ${JSON.stringify(env.appName)},`,
    `  apiUrl: ${JSON.stringify(env.apiUrl)},`,
    '};',
    '',
  ].join('\n');
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, toTypeScript(resolveEnvironment()), 'utf8');
