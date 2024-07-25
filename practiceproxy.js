import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxies from "./Scrapper/settings/proxy.js";
import proxyChain  from "proxy-chain";
import userAgents from "./Scrapper/settings/userAgents.js";
import { fetchProxies } from "./Scrapper/API.js";
puppeteer.use(StealthPlugin);
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export default class PuppeteerActor {
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
    const oldProxyUrl = `http://${this.proxy.userName}:${this.proxy.password}@${this.proxy.proxy}:${this.proxy.port}`;
    console.log(oldProxyUrl)
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
    this.proxy = newProxyUrl;
    console.log(this.proxy);
    const agent = userAgents?.UserAgent;
    const randomAgent = Math.floor(Math.random() * agent.length);
    this.agent = agent[randomAgent];
    console.log(`user agent: ${this.agent}`);
    } catch (error) {
      console.log('set proxy error: ', error)
    }
    
  };
  setData = async () => {
    try {
      
        const browser = await puppeteer.launch({
          headless: false,
          args: [
            "--start-maximized",
            '--proxy-server='+this.proxy
          ],
        //   executablePath:
        //     "C:/Program Files/Google/Chrome/Application/chrome.exe",
        //   userDataDir:
        //     "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
        })
        // Do your magic here...
        const page = await browser.newPage();
        //  await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`)
        const { width, height } = await page.evaluate(() => {
          return {
            width: window.screen.width,
            height: window.screen.height,
          };
        });

        // Set the viewport to the screen dimensions
        await page.setViewport({ width, height });
    
        await page.goto(this.url, {timeout: 120000});
        return 'success';
    } catch (error) {
      console.log("error: ", error)
    }
  };
}

const actor = new PuppeteerActor("https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578")

const { data: dataProxies, status: statusProxies } = await fetchProxies();
if (statusProxies == 200) {
  proxies.proxies = dataProxies.data;
  actor.start().then(async (result)=>{
   
    console.log(`running `)
}).catch((error)=>{
    console.log("error: ", error)
})
}
