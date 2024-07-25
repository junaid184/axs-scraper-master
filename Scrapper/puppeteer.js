import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxies from "./settings/proxy.js";
import proxyChain  from "proxy-chain";
import userAgents from "./settings/userAgents.js";
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
    this.proxy.proxy = newProxyUrl;
    console.log(this.proxy.proxy);
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
      let promise = new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewpageort: null,
          args: [
            "--start-maximized",
            "--no-sandbox",
            "--shm-size=1gb", // this solves the issue
            "--proxy-server=" + this.proxy.proxy,
            "--no-zygote",
          ],
          executablePath:
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
          userDataDir:
            "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
        });

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
        await delay(1000);
        await page.authenticate({
          username: this.proxy.username,
          password: this.proxy.password,
        });
        await page.goto(this.url, {
         
          timeout: 120000,
        });
        await this.delay(30000);
        const button = await page.$(
          `#POP_UP_MODAL > div > div > div.modal-main > div.modal-footer > div > div > button`,
          { visible: true, timeout: 30000 }
        );
        if (button) {
          // notice popup button click condition
          await button.click();
        }
        const element = await page.$(`div[class="sc-efNZxp cCzpTs"]`);
        console.log(element);
        if (element) {
          // tickets prices on left side condition
          const elements = await page.$$('div[class="sc-efNZxp cCzpTs"]'); // Target exact class string

          const allText = [];
          for (const element of elements) {
            const text = await element.innerText();
            allText.push(text);
          }
          await browser.close().then(async (x) => {
            return resolve(true);
          });
          console.log(
            'Text for elements with class "sc-efNZxp cCzpTs":',
            allText
          );
        } else {
          const innerText = await page.evaluate(() => {
            const element = document.querySelector(
              `#main > div > div > div.layout > div > div > div > div > div > div > div > div > article > aside > div > section > div.sc-jRGJub.gpfqxZ > h1`
            );
            return element ? element.innerText : null;
          });
          console.log(`innert text of picking up ticket from map: `, innerText);
          if (innerText === "Pick Your Tickets on Map") {
            // map condition
            page.on("response", async (response) => {
              if (this.price && this.seatData?.length > 0) {
                await browser.close().then(async (x) => {
                  return resolve(true);
                });
              }
              const url = response.url();

              // Filter out OPTIONS requests
              if (!response.ok() || response.request().method() === "OPTIONS") {
                return;
              }

              if (url.includes("/offer/search?flow=pick_a_seat_2d&utm_cid")) {
                console.log(url);
                const jsonResponse = await response.json();
                this.seatData = jsonResponse.offers;
                // console.log(`response:`, jsonResponse.offers[0].items[0]);
              }
              if (
                url.includes(
                  "/price?excludeResaleTaxes=false&flow=pick_a_seat_2d&getSections=true&includeDynamicPrice=true&includeSoldOuts=false&locale=en-US&utm_cid"
                )
              ) {
                console.log(url);
                const jsonResponse = await response.json();
                this.price = jsonResponse;
              }
            });
            setTimeout(() => {
              browser.close();
              resolve(false);
            }, 40000);
          } else {
            await browser.close().then((x) => {
              return resolve(true);
            });
          }
        }
      });
      return promise;
    } catch (error) {
      console.log("error: ", error.message);
      await browser.close().then((x) => {
        return resolve(false);
      });
    }
  };

  getPriceData = async () => {
    if (this.price) {
      return this.price;
    } else {
      return undefined;
    }
  };
  getSeatData = async () => {
    if (this.seatData) {
      return this.seatData;
    } else {
      return undefined;
    }
  };
  getProxy = () => {
    if (this.proxy != null) {
      return this.proxy;
    } else {
      return undefined;
    }
  };
}
