import sys
from playwright.sync_api import sync_playwright

def test_url(url):
    print(f"\n--- Testing {url} ---")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[ERROR] {err.message}"))
        
        try:
            response = page.goto(url, timeout=60000)
            print(f"Status code: {response.status if response else 'No Response'}")
            page.wait_for_timeout(5000)  # Wait 5 seconds for Clerk to load
            
            print("Page Title:", page.title())
            
            # Check for buttons
            buttons = page.locator("button").all()
            print(f"Found {len(buttons)} buttons:")
            for i, btn in enumerate(buttons):
                if btn.is_visible():
                    print(f"  {i}: Text: '{btn.inner_text().strip()}', Class: '{btn.get_attribute('class')}'")
            
            # Print console messages
            print("Console messages:")
            for msg in console_messages:
                print(msg)
                
        except Exception as e:
            print("Error during test:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    test_url("https://www.altarvision.tech")
