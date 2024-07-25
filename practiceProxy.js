import puppeteer from "puppeteer";
import proxyChain from "proxy-chain";
async function run() {
    const oldProxyUrl = 'http://OR1657325346:r2uyMQp1@208.194.205.11:7610';
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  const browser = await puppeteer.launch({
    headless: false,
    args: [ '--proxy-server='+newProxyUrl ]
  });
  const page = await browser.newPage();
  
  const pageUrl = 'https://whatismyipaddress.com/';

  await page.goto(pageUrl, {timeout: 1200000});
}

run();