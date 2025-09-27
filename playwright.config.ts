import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/playwright',
    use: {
        baseURL: 'http://127.0.0.1:8080/',
        headless: true,
    },
});
