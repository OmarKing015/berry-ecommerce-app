from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to test the mobile-specific functionality
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
            is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()

        page.goto("http://localhost:3000/customize", wait_until="networkidle")

        # Open the dialog for text/logo selection
        # In the mobile view, this is the palette icon button
        palette_button = page.locator('button[aria-haspopup="dialog"]').nth(1)
        palette_button.click()

        # Wait for the dialog to appear
        dialog = page.locator('div[role="dialog"]')
        expect(dialog).to_be_visible()

        # Click the "Logo" tab
        logo_tab_trigger = page.locator('button[role="tab"][value="logo"]')
        logo_tab_trigger.click()

        # Wait for the initial set of logos to be visible
        page.wait_for_selector('.grid.grid-cols-4.gap-2 img', timeout=15000)
        page.screenshot(path="jules-scratch/verification/01_mobile_initial_logos.png")

        # Find and click the "Next" button
        next_button = page.get_by_role("button", name="Next")
        expect(next_button).to_be_visible()
        next_button.click()

        # Wait for the new logos to load
        page.wait_for_timeout(2000)
        page.screenshot(path="jules-scratch/verification/02_mobile_after_next.png")

        # Click the first logo
        first_logo = page.locator('.grid.grid-cols-4.gap-2 button').first
        first_logo.click()

        # The dialog should close automatically. We can assert this by checking if it's not visible.
        expect(dialog).not_to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_mobile_after_logo_selection.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
