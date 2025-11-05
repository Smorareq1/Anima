import { test, expect } from '@playwright/test';
import { testConfig } from './env';

const { Email, Password } = testConfig.TestRecommendation;
const { ImageUrl } = testConfig.TestFavorites;
const { baseUrl } = testConfig.Main;

test('Flujo completo de favoritos - generar, agregar y validar', async ({ page }) => {
    await page.goto(baseUrl);
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

    await fileInput.setInputFiles({
        name: 'foto2_desde_url.jpeg',
        mimeType: 'image/jpeg',
        buffer: buffer
    });

    await page.getByRole('button', { name: 'Generar recomendación' }).click();

    const nameInput = page.getByRole('textbox', { name: 'Escribe un nombre para tu' });
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Prueba Favoritos');

    await page.getByRole('button', { name: 'Guardar Playlist' }).click();
    await expect(page.getByRole('heading', { name: 'Prueba Favoritos' })).toBeVisible();

    await page.getByRole('link', { name: 'Historial' }).click();
    await expect(page.getByRole('heading', { name: 'Prueba Favoritos' }).first()).toBeVisible();

    const addToFavoritesButton = page.getByRole('button', { name: 'Agregar a favoritos' }).first();
    await expect(addToFavoritesButton).toBeVisible();
    await addToFavoritesButton.click();

    const removeFromFavoritesButton = page.getByRole('button', { name: 'Quitar de favoritos' }).first();
    await expect(removeFromFavoritesButton).toBeVisible();
    await removeFromFavoritesButton.click();

    await expect(addToFavoritesButton).toBeVisible();
    await addToFavoritesButton.click();

    await page.getByRole('link', { name: 'Favoritas' }).click();
    await expect(page.getByRole('heading', { name: 'Prueba Favoritos' })).toBeVisible();
});
