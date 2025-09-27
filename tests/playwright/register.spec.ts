import { test, expect } from '@playwright/test';

test('validación de registro', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080/');

    // Ir al registro
    await page.getByRole('link', { name: 'Regístrate' }).click();

    // Click en botón empezar sin llenar campos
    await page.getByRole('button', { name: 'Empezar' }).click();

    // Validar que todos los campos muestran "Campo obligatorio"
    await expect(page.getByText('NombreCampo obligatorio')).toBeVisible();
    await expect(page.getByText('ApellidoCampo obligatorio')).toBeVisible();
    await expect(page.getByText('UsuarioCampo obligatorio')).toBeVisible();
    await expect(page.getByText('CorreoCampo obligatorio')).toBeVisible();
    await expect(page.getByText('ContraseñaCampo obligatorio')).toBeVisible();
    await expect(page.getByText('Confirma tu contraseña')).toBeVisible();

    // Ingresar correo inválido
    await page.getByRole('textbox', { name: 'Correo' }).fill('correo-invalido');
    await expect(page.getByText('Ingresa un correo electrónico válido')).toBeVisible();

    // Ingresar contraseña inválida (< 8 caracteres)
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('123');
    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();

    // Ingresar confirmación que no coincide
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('diferente123');
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();

    //Llenar campos
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Juan');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Pérez');
    await page.getByRole('textbox', { name: 'Usuario' }).fill('juanperez');
    await page.getByRole('textbox', { name: 'Correo' }).fill('juan@example.com');

    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('password123');
    //Validar mayusculas y simbolos
    await expect(page.getByText('La contraseña debe contener al menos una mayúscula, una minúscula y un número')).toBeVisible();
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Contraseña@5689');
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('Contraseña@5689');

    // Click en Empezar de nuevo
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page).toHaveURL(/first-upload/);
});
