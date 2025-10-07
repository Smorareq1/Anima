import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('validación de registro', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080/');

    // Datos aleatorios
    const nombre = faker.person.firstName();
    const apellido = faker.person.lastName();
    const usuario = faker.internet.username({ firstName: nombre, lastName: apellido }).toLowerCase().replace(/[^a-z0-9]/g, '');;
    const correo = faker.internet.email({ firstName: nombre, lastName: apellido }).toLowerCase();

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

    // Llenar campos válidos
    await page.getByRole('textbox', { name: 'Nombre' }).fill(nombre);
    await page.getByRole('textbox', { name: 'Apellido' }).fill(apellido);
    await page.getByRole('textbox', { name: 'Usuario' }).fill(usuario);
    await page.getByRole('textbox', { name: 'Correo' }).fill(correo);

    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Contraseña@5689');
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('Contraseña@5689');

    // Click en Empezar
    await page.getByRole('button', { name: 'Empezar' }).click();

    await expect(page).toHaveURL(/first-upload/);
});
