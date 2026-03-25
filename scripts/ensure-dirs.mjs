import { mkdirSync } from 'node:fs';

mkdirSync('reports/allure-results', { recursive: true });
mkdirSync('reports', { recursive: true });
