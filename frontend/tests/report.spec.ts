import { test, expect } from '@playwright/test';

test.describe('Post-Interview Report Page Functionality', () => {
  test('should display loading, then render the report page with mocked data', async ({ page }) => {
    // Mock the feedback API response
    await page.route('**/api/interviews/*/feedback', async route => {
      const mockFeedback = {
        id: 1,
        sessionId: 123,
        overallScore: 85,
        technicalScore: 90,
        communicationScore: 80,
        clarityScore: 85,
        confidenceScore: 88,
        strengths: "- Strong technical knowledge\n- Good problem-solving skills",
        weaknesses: "- Tends to speak too fast\n- Needs more structured answers",
        detailedReview: "Overall, you performed very well. Your technical understanding is solid.",
        improvementPlan: "- Practice STAR method\n- Take pauses before answering",
        recommendationLevel: "Strong Hire"
      };
      
      // Delay to simulate network and see the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({ json: mockFeedback });
    });

    // Navigate directly to a mock report page
    await page.goto('/interviews/123/report');

    // Wait for the mock API to resolve and check for elements
    await expect(page.locator('h1', { hasText: 'Post-Interview Report' })).toBeVisible();

    // Verify Overall Score is displayed
    await expect(page.locator('span', { hasText: '85' })).toBeVisible();

    // Verify Recommendation Level
    await expect(page.locator('text=Recommendation: Strong Hire')).toBeVisible();

    // Verify Detailed Review text
    await expect(page.locator('text=Overall, you performed very well. Your technical understanding is solid.')).toBeVisible();

    // Verify Strengths
    await expect(page.locator('text=Strong technical knowledge')).toBeVisible();
    
    // Verify Weaknesses
    await expect(page.locator('text=Needs more structured answers')).toBeVisible();

    // Click 'Back to Dashboard' button
    await page.locator('button', { hasText: 'Back to Dashboard' }).click();

    // Ensure it navigates back to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
