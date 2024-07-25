import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
import { fetchProxies } from "./Scrapper/API.js";
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
let proxies = {
    proxies: []
}

let userAgents = {
    UserAgent: []
}
class PuppeteerActor {
  proxy = null;
  agent = null;
  price = null;
  seatData = null;
  url = null;
  constructor(_url) {
    this.url = _url;
  }
  start = async () => {
    this.setProxy();
    return await this.setData();
  };
  delay = (time) => {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  };
  setProxy = async () => {
    try {
      const p = proxies?.proxies;
      const random = Math.floor(Math.random() * p.length);
      this.proxy = p[random];
      const agent = userAgents?.UserAgent;
      const randomAgent = Math.floor(Math.random() * agent.length);
      this.agent = agent[randomAgent];
      console.log(`user agent: ${this.agent}`);
    } catch (error) {
      console.log("set proxy error: ", error);
    }
  };
  setData = async () => {
    try {
      if (this.proxy) {
        let newProxyUrl = await proxyChain.anonymizeProxy(
          `http://${this.proxy.userName}:${this.proxy.password}@${this.proxy.proxy}:${this.proxy.port}`
        );
        let promise = new Promise(async (resolve, reject) => {
          puppeteer.use(StealthPlugin);
          const browser = await puppeteer.launch({
            headless: false,
            args: ["--proxy-server=" + newProxyUrl],
            executablePath:
              "C:/Program Files/Google/Chrome/Application/chrome.exe",
            userDataDir:
              "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
          });
          const page = await browser.newPage();
          await page.setUserAgent(
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`
          );

          await page.goto(this.url, { timeout: 1200000 });

          await delay(120000);

          await browser.close();

          await proxyChain.closeAnonymizedProxy(newProxyUrl, true);

         

          return resolve(true);
        });

        return promise;
      } else {
        console.log(`proxy is null`);
      }
    } catch (error) {
      console.log("error at set Data: ", error);
    }
  };
}
async function run() {
  const { data, status } = await fetchProxies();
  
  if(status === 200)
  {
    proxies.proxies = data.data;

    let _actor = new PuppeteerActor("https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578")

    let dataGet = await _actor.start();

    if(dataGet)
    {
        console.log(`promise resolved`);
    }
  }
}

run();
