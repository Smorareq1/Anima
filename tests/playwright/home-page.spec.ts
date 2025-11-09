import { test, expect } from '@playwright/test';

test('homepage muestra todos los elementos principales', async ({ page }) => {
    await page.goto('/');

    // Logo
    await expect(page.getByRole('img', { name: 'Ánima logo' })).toBeVisible();

    // Heading principal
    await expect(
        page.getByRole('heading', { name: /Música que refleja como te/i })
    ).toBeVisible();

    // Links principales del menú
    await expect(page.getByRole('link', { name: 'Empieza ahora' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Conocer más' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inicia sesión' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Conocer más' }).nth(1)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Conocer más' }).nth(3)).toBeVisible();
    await expect(page.getByRole('button', { name: '▶ Ver tutorial' })).toBeVisible();

    // CTA en sección final
    await expect(
        page.locator('section').filter({ hasText: 'Empieza a usar ÁNIMA hoy' }).getByRole('link')
    ).toBeVisible();

    // Footer
    await expect(page.getByRole('contentinfo')).toBeVisible();

    // Botones de auth
    await expect(page.getByRole('link', { name: 'Regístrate' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inicia Sesión' })).toBeVisible();

    // Logo de Spotify
    await expect(page.getByRole('img', { name: 'Spotify' }).nth(1)).toBeVisible();
});
