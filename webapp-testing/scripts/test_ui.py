import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[ERROR] {err.message}"))
        
        print("Navigating to http://localhost:3000...")
        try:
            page.goto("http://localhost:3000", timeout=60000)
            page.wait_for_timeout(5000)  # Wait 5 seconds for Clerk to load
            
            print("\nPage Title:", page.title())
            
            # Print all visible buttons
            buttons = page.locator("button").all()
            print(f"\nFound {len(buttons)} buttons:")
            for i, btn in enumerate(buttons):
                if btn.is_visible():
                    print(f"  {i}: Text: '{btn.inner_text().strip()}', ID: '{btn.get_attribute('id')}', Class: '{btn.get_attribute('class')}'")
            
            # Print console messages
            print("\nConsole messages:")
            for msg in console_messages:
                print(msg)
                
            # Take screenshot
            import os
            os.makedirs("webapp-testing/screenshots", exist_ok=True)
            page.screenshot(path="webapp-testing/screenshots/homepage.png")
            print("\nScreenshot saved to webapp-testing/screenshots/homepage.png")
        except Exception as e:
            print("Error during test:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    run()
