import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Utente non autenticato: l'app reindirizza alla pagina di login.
  expect(await page.locator('h1').innerText()).toContain(
    'Pianificazione Appelli'
  );
});
