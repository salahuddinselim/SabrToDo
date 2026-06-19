import asyncio
from playwright.async_api import async_playwright

async def check_pages():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp('http://localhost:9222')
        page = browser.contexts[0].pages[0]

        await page.goto('https://sabrflow.vercel.app/dashboard', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(1000)
        print(f'URL: {page.url}')

        cookies = await page.context.cookies('https://sabrflow.vercel.app')
        print(f'Cookies: {len(cookies)}')
        for c in cookies:
            print(f'  {c["name"]}: {c["value"][:40]}...')

        await page.screenshot(path='sabrflow-after.png', full_page=True)

        title = await page.title()
        body = await page.evaluate('() => document.body?.innerText?.substring(0, 300)')
        print(f'Title: {title}')
        print(f'Body preview: {body}')

        await browser.close()

asyncio.run(check_pages())
