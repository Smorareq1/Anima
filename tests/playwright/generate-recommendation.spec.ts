import { test, expect } from '@playwright/test';
import { testConfig } from './env';

const { Email, Password, ImageUrl } = testConfig.TestRecommendation;

test('Flujo completo de recomendación de playlist con URL y env', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080/');
    await page.getByRole('link', { name: 'Inicia sesión' }).click();

    await page.locator('#email').fill(Email);
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(Password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const recommendLink = page.getByRole('link', { name: 'Recomendar' });
    await expect(recommendLink).toBeVisible();
    await recommendLink.click();

    await expect(page.getByText('Sube tu foto')).toBeVisible();

    const fetchResponse = await fetch(ImageUrl);
    expect(fetchResponse.ok, 'La descarga de la imagen falló').toBeTruthy();

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
        name: 'foto_desde_url.jpeg',
        mimeType: 'image/jpeg',
        buffer: buffer
    });

    const previewImage = page.getByRole('img', { name: 'preview' });
    await expect(previewImage).toBeVisible();

    await page.getByRole('button', { name: '✕' }).click();
    await expect(previewImage).not.toBeVisible();

    await fileInput.setInputFiles({
        name: 'foto2_desde_url.jpeg',
        mimeType: 'image/jpeg',
        buffer: buffer
    });

    await page.getByRole('button', { name: 'Generar recomendación' }).click();

    const nameInput = page.getByRole('textbox', { name: 'Escribe un nombre para tu' });
    await expect(nameInput).toBeVisible();

    await nameInput.fill('Prueba E2E');
    await page.getByRole('button', { name: 'Guardar Playlist' }).click();

    await expect(page.getByRole('heading', { name: 'Prueba E2E' })).toBeVisible();

    const spotifyButton = page.getByRole('button', { name: /Abrir en Spotify/ });
    await expect(spotifyButton).toBeVisible();
});
