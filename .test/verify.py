import sys
from playwright.sync_api import sync_playwright

URL = "http://localhost:4173/"
errors = []
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS" if cond else "FAIL"), name, "-", detail)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(str(e)))

    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)

    # 1. cards rendered
    cards = page.locator(".card")
    check("52 cards render", cards.count() == 52, f"got {cards.count()}")

    # 2. default lang zh: first card title should be Chinese
    first_title = page.locator(".card h3").first.inner_text()
    check("default zh title", any("一" <= c <= "鿿" for c in first_title), first_title)

    # 3. chips render (all + 8 categories = 9)
    chips = page.locator(".chip")
    check("9 category chips", chips.count() == 9, f"got {chips.count()}")

    # 4. screenshot zh light
    page.screenshot(path="/tmp/codex-1-zh-light.png", full_page=False)

    # 5. language toggle -> EN
    page.locator("#lang-en").click()
    page.wait_for_timeout(300)
    en_title = page.locator(".card h3").first.inner_text()
    check("toggle EN title is latin", all(ord(c) < 0x3000 for c in en_title), en_title)
    page.screenshot(path="/tmp/codex-2-en-light.png", full_page=False)

    # 6. category filter: click 'coding' chip (data-cat=coding) -> 11 cards
    page.locator('.chip[data-cat="coding"]').click()
    page.wait_for_timeout(300)
    check("coding filter = 11 cards", page.locator(".card").count() == 11, f"got {page.locator('.card').count()}")

    # reset to all
    page.locator('.chip[data-cat="all"]').click()
    page.wait_for_timeout(200)

    # 7. search 'figma'
    page.locator("#search").fill("figma")
    page.wait_for_timeout(300)
    n_search = page.locator(".card").count()
    check("search 'figma' returns >=1, <52", 1 <= n_search < 52, f"got {n_search}")
    page.locator("#search-clear").click()
    page.wait_for_timeout(200)
    check("clear search restores 52", page.locator(".card").count() == 52, f"got {page.locator('.card').count()}")

    # 8. open dialog on first card
    page.locator(".card").first.click()
    page.wait_for_timeout(400)
    check("dialog open", page.locator("#scrim.open").count() == 1)
    check("dialog has steps", page.locator(".dialog ol.steps li").count() >= 1, f"steps {page.locator('.dialog ol.steps li').count()}")
    check("dialog has overview", len(page.locator(".dialog p.lead").first.inner_text()) > 10)
    page.screenshot(path="/tmp/codex-3-dialog-en.png", full_page=False)

    # 9. copy button exists & click
    if page.locator("#copy-btn").count():
        page.locator("#copy-btn").click()
        page.wait_for_timeout(200)
        check("copy button toggles copied", page.locator("#copy-btn.copied").count() == 1)
    else:
        check("copy button present (first card)", False, "no prompt on first card")

    # 10. next navigation
    page.locator("#dlg-next").click()
    page.wait_for_timeout(300)
    check("dialog next navigates", page.locator("#scrim.open").count() == 1)

    # close with Escape
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    check("dialog closes on Escape", page.locator("#scrim.open").count() == 0)

    # 11. theme toggle -> dark
    page.locator("#lang-zh").click()
    page.wait_for_timeout(150)
    page.locator("#theme-toggle").click()
    page.wait_for_timeout(300)
    theme = page.evaluate("document.documentElement.dataset.theme")
    check("theme toggles to dark", theme == "dark", theme)
    page.screenshot(path="/tmp/codex-4-zh-dark.png", full_page=False)

    # 12. deep link
    page.goto(URL + "#figma-designs-to-code")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)
    check("deep link opens dialog", page.locator("#scrim.open").count() == 1)

    check("no console errors", len(console_errors) == 0, "; ".join(console_errors[:5]))
    browser.close()

failed = [r for r in results if not r[1]]
print("\n==== %d/%d passed ====" % (len(results) - len(failed), len(results)))
sys.exit(1 if failed else 0)
