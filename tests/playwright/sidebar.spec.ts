import { test, expect } from '@playwright/test';

test('Iniciar sesión y verificar sidebar', async ({ page }) => {
    // Ir a la página principal
    await page.goto('http://127.0.0.1:8080/');

    // Ir al formulario de login
    await page.getByRole('link', { name: 'Inicia sesión' }).click();

    // Completar credenciales
    await page.locator('#email').fill('ysmorareq@gmail.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Morales@2005');

    // Enviar formulario
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Esperar a que cargue la interfaz del usuario autenticado
    await expect(page.getByRole('complementary')).toBeVisible(); // sidebar

    // Verificar botones del sidebar
    await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Recomendar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PlayList' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Favoritas' })).toBeVisible();
});
