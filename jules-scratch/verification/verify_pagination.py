from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # The default URL for Next.js dev server
        page.goto("http://localhost:3000/customize", wait_until="networkidle")

        # Open the dialog for text/logo selection
        # Using a more specific selector for the logo tab trigger
        logo_tab_trigger = page.locator('button[role="tab"][value="logo"]')

        # The button to open the dialog might be the one with the palette icon
        # Let's try to find a more robust way to open the logo panel
        # Based on the code, it seems the logo tab is inside a dialog
        # Let's find the trigger for that dialog first.
        # The mobile view has a palette button, let's assume desktop view first

        # In desktop view, the logo tab should be visible directly.
        # Let's check if the logo tab is in a dialog or not

        # It looks like the tabs are inside a dialog on mobile, but directly on desktop.
        # The test will run on a desktop-like environment, so we should be able to click the logo tab.

        # Click the "Logo" tab
        logo_tab_trigger.click()

        # Wait for the initial set of logos to be visible
        page.wait_for_selector('.grid.grid-cols-4.gap-2 img', timeout=10000) # wait up to 10s
        page.screenshot(path="jules-scratch/verification/01_initial_logos.png")

        # Find and click the "Load More" button
        load_more_button = page.get_by_role("button", name="Load More")

        # Ensure the button is visible before clicking
        expect(load_more_button).to_be_visible()

        # Click the "Load More" button
        load_more_button.click()

        # Wait for the new logos to load. We can check for the loader to disappear
        # or for the number of logos to increase.
        # A simple wait should be enough for this verification.
        page.wait_for_timeout(2000) # wait for 2 seconds for logos to load

        page.screenshot(path="jules-scratch/verification/02_after_load_more.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
