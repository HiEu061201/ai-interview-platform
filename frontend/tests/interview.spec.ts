import { test, expect } from '@playwright/test';

test.describe('Interview Setup and Room Functionality', () => {
  // Use a simulated logged-in state or just navigate directly since routes might not be protected by auth middleware in React yet
  test('should setup interview and navigate to interview room', async ({ page }) => {
    // Navigate to Interview Setup page
    await page.goto('/interviews/new');

    // Expect to see the Setup heading
    await expect(page.locator('h1')).toHaveText('Interview Setup');

    // Select Job Title
    await page.locator('select').selectOption('Backend Developer');

    // Select Experience Level
    await page.getByLabel('Senior').check();

    // Select Interview Type
    await page.getByLabel('Behavioral').check();

    // Verify summary updates
    await expect(page.locator('p:has-text("Backend Developer")').first()).toBeVisible();
    await expect(page.locator('text=Senior').first()).toBeVisible();

    // Click Launch Interview
    await page.getByRole('link', { name: 'Launch Interview' }).click();

    // Wait for navigation to /interviews/123
    await expect(page).toHaveURL(/.*\/interviews\/123/);

    // Verify Interview Room page elements
    await expect(page.locator('span', { hasText: 'AI Mock Interview' })).toBeVisible();
    
    // Type a message in the chat input
    const inputLocator = page.getByPlaceholder('Type your answer...');
    await inputLocator.fill('Hello, I am ready for the interview.');
    
    // Send the message
    await page.locator('button').filter({ has: page.locator('svg.lucide-send') }).click();

    // Verify user message appears in the chat overlay
    await expect(page.locator('text=Hello, I am ready for the interview.')).toBeVisible();
  });
});
