import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ATS Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should upload resume, analyze, and apply improvements', async ({ page }) => {
    // 1. Go to ATS Checker page
    await page.goto('/ats-checker');

    // Verify we are on the right page
    await expect(page.getByRole('heading', { name: /¿Tu CV pasa el filtro ATS\?/i })).toBeVisible();

    // 2. Select an industry (e.g., Tech)
    const techIndustry = page.getByRole('button', { name: /Seleccionar industria Tecnología/i });
    // On mobile it might be different, but playwright config uses Desktop Chrome
    await techIndustry.click();

    // 3. Upload a resume
    await page.getByLabel('Seleccionar archivo CV').setInputFiles(path.join(__dirname, 'sample-resume.txt'));

    // Verify file is uploaded (shows "Cambiar archivo" button)
    await expect(page.getByRole('button', { name: /Cambiar archivo/i })).toBeVisible();

    // 4. Trigger ATS analysis
    const analyzeButton = page.getByRole('button', { name: 'Analizar CV', exact: true });
    await analyzeButton.click();

    // 5. Wait for analysis (handle asynchronous nature)
    // The button shows "Analizando tu CV..." while loading
    await expect(page.getByText('Analizando tu CV...')).toBeVisible();

    // Wait for Results - ScoreCard should appear
    // We can look for "Análisis Completado" heading
    await expect(page.getByRole('heading', { name: 'Análisis Completado' })).toBeVisible({ timeout: 60000 });

    // Verify score is visible
    // It's a span with the score value, inside the analysis completed card
    await expect(page.locator('span.text-4xl.sm\\:text-5xl.font-black')).toBeVisible();

    // 6. Apply suggested improvements
    // The button has an aria-label: "Aplicar mejoras y abrir el editor"
    const applyButton = page.getByRole('button', { name: 'Aplicar mejoras y abrir el editor', exact: true });
    await applyButton.click();

    // 7. Verify redirect to CV Builder and data is loaded
    // It redirects to /?flow=builder
    await page.waitForURL(url => url.pathname === '/' && url.searchParams.get('flow') === 'builder', { timeout: 30000 });

    // Verify CV Builder is open
    // Wait for the main editor container
    await expect(page.getByText('Información Personal')).toBeVisible({ timeout: 30000 });

    // Verify the name from our sample resume is in the input
    // Use getByLabel or a more resilient selector
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue('John Doe', { timeout: 30000 });
  });
});
