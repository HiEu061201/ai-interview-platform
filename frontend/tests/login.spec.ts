import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test('should navigate to dashboard upon successful username/password login', async ({ page }) => {
    // Listen to console and page errors
    page.on('console', msg => console.log(msg.text()));
    page.on('pageerror', exception => console.log(`Uncaught exception: "${exception}"`));
    
    // Navigate to login page
    await page.goto('/login');

    // Expect to see the Welcome Back heading
    await expect(page.locator('h1')).toHaveText('Welcome Back');

    // Fill in username
    await page.getByPlaceholder('johndoe').fill('testuser');
    
    // Fill in password
    await page.getByPlaceholder('••••••••').fill('password123');

    // Mock the backend API response
    await page.route('http://localhost:8080/api/auth/login', async route => {
      const json = { accessToken: 'fake-jwt-token' };
      await route.fulfill({ json });
    });

    // Click Sign In
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify navigation to /interviews/new
    await expect(page).toHaveURL(/.*\/interviews\/new/);
  });
});
