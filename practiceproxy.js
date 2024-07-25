import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import { fetchProxies } from "./Scrapper/API.js";
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function run() {
  const { data, status } = await fetchProxies();
  const p = data.data;
  const random = Math.floor(Math.random() * p.length);
  const proxy = p[random];

  const oldProxyUrl = `http://${proxy.userName}:${proxy.password}@${proxy.proxy}:${proxy.port}`;
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  puppeteer.use(StealthPlugin);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--proxy-server=" + newProxyUrl],
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    userDataDir: "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
  });
  const page = await browser.newPage();
  await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`)
  const pageUrl =
    "https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578";

  await page.goto(pageUrl, { timeout: 1200000 });
  await delay(120000);
//   proxyChain.closeAnonymizedProxy(newProxyUrl, true);
}

run();
