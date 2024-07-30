import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxies from "./settings/proxy.js";
import proxyChain from "proxy-chain";
import userAgents from "./settings/userAgents.js";
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
  isMap = null;
  isSideBar = null;
  isModal = null;
  isPage = null;
  constructor(_url, isMap, isModal, isSideBar, isPage) {
    this.url = _url;
    this.isMap = isMap;
    this.isModal = isModal;
    this.isSideBar = isSideBar;
    this.isPage = isPage;
  }

  start = async () => {
    this.setProxy();
    if (this.isMap) {
      return await this.setDataFromMap();
    }
    if (this.isSideBar) {
      return await this.setDataFromSideBar();
    }
    if(this.isPage)
    {
      return await this.setDataFromPage();
    }
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
    } catch (error) {
      console.log("set proxy error: ", error);
    }
  };
  puppeteerStart = async (proxy, resolve) => {
    try {
      puppeteer.use(StealthPlugin);
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--proxy-server=" + proxy],
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        userDataDir:
          "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
      });
      const page = await browser.newPage();
      await page.setUserAgent(this.agent.agent);

      await page.goto(this.url, { timeout: 1200000 });

      await delay(3000);

      let noValid = await page.$(
        `#EXCEPTION_MESSAGE > div > div > div.modal-main > div.modal-body-wrapper > div > span > p`,
        { visible: true }
      );
      if (noValid) {
        console.log(`no valid link`);
        await browser.close();
        await proxyChain.closeAnonymizedProxy(proxy, true);
        return false;
      }
      let captcha = await page.$(`#en-US > h2:nth-child(2)`);
      if (captcha) {
        console.log(`captcha found`);
        await browser.close();
        await proxyChain.closeAnonymizedProxy(proxy, true);
        return false;
      }
      let notAvailable = await page.$(
        `#main > div > div > div > div.page-wrapper.page-wrapper--external-flow > div > div > div > div > div > div > div > h1`
      );
      if (notAvailable) {
        await browser.close();
        await proxyChain.closeAnonymizedProxy(proxy, true);
        console.log(`ticket is not available`);
        return false;
      }
      if (this.isModal) {
        console.log(`on modal condition`);

        await page.waitForSelector(
          "#POP_UP_MODAL > div > div > div.modal-main > div.modal-footer > div > div > button"
        );
        const button = await page.$(
          `#POP_UP_MODAL > div > div > div.modal-main > div.modal-footer > div > div > button`
        );
        if (button) {
          console.log(`modal button found`);
          // notice popup button click condition
          await button.click();
          console.log(`clicked on modal`);
        }
      }

      return { page, browser };
    } catch (error) {
      console.log("error at starting puppeteer: ", error);
      return false;
    }
  };
  setDataFromPage = async () => {
    try {
      let promise = new Promise(async (resolve, reject) => {
        let newProxyUrl = await proxyChain.anonymizeProxy(
          `http://${this.proxy.userName}:${this.proxy.password}@${this.proxy.proxy}:${this.proxy.port}`
        );
        const page = await this.puppeteerStart(newProxyUrl);
        // map condition
        if (!page) {
          return resolve(false);
        } else {
          const ticketsLimit = await page.page.evaluate(() => {
            // Select the element
            const element = document.querySelector(
              "#main > div > div > div > div > div > div > div > div > div > div > div > div.sidebar.reservation.col-md-5.col-xs-12 > div > div:nth-child(3) > div > div.module.module--number-of-tickets > div:nth-child(2) > div > div.module__title--subtitle > span"
            );
            // Return the innerText of the element
            return element ? element.innerText : null;
          });

          const data = await page.page.evaluate(() => {
            // Select all elements with the class 'price-level'
            const priceLevels = document.querySelectorAll(
            'div[class="price-level-container"]'
            );
            // Initialize an array to hold the extracted data
            const results = [];

            // Iterate over each price-level element
            priceLevels.forEach((priceLevel) => {
              // Extract the text from .price-range and .radio-inline within this price-level
              const priceRange =
                priceLevel.querySelector('div[class="price-range"]')?.innerText.trim() ||
                "";
              const radioInline =
                priceLevel.querySelector('label[class="radio-inline"]')?.innerText.trim() ||
                "";

              // Push the extracted data as an object into the results array
              results.push({
                priceRange,
                radioInline,
              });
            });

            // Return the results array
            return results;
          });

          console.log("data from page: ", data); // Print the array of objects to the console
          
          // Close the browser
          await page.browser.close();
          resolve(true);
          console.log(`ticket limit: ${ticketsLimit}`);
          return {data, ticketsLimit};
        }
      });
      return promise
    } catch (e) {
      console.log(`error from the page: `, e)
    }
  };
  setDataFromSideBar = async () => {
    ///offers?onsaleID this is the end point to find the side bar data
    try {
      let promise = new Promise(async (resolve, reject) => {
        let newProxyUrl = await proxyChain.anonymizeProxy(
          `http://${this.proxy.userName}:${this.proxy.password}@${this.proxy.proxy}:${this.proxy.port}`
        );
        const page = await this.puppeteerStart(newProxyUrl);
        // map condition
        if (!page) {
          return resolve(false);
        } else {
          page.page.on("response", async (response) => {
            if (this.seatData?.length > 0) {
              await page.browser.close().then(async (x) => {
                return resolve(true);
              });

              await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
            }
            const url = response.url();

            // Filter out OPTIONS requests
            if (!response.ok() || response.request().method() === "OPTIONS") {
              return;
            }

            if (url.includes("/offers?onsaleID")) {
              console.log(url);
              const jsonResponse = await response.json();
              this.seatData = jsonResponse.listings;
              // console.log(`response:`, jsonResponse.offers[0].items[0]);
            }
          });
          setTimeout(async () => {
            console.log(`website is down`);
            await page.browser.close();
            await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
            resolve(false);
          }, 40000);
        }
      });
      return promise;
    } catch (error) {
      console.log("set data from side bar error: ", error);
    }
  };
  setDataFromMap = async () => {
    try {
      let promise = new Promise(async (resolve, reject) => {
        let newProxyUrl = await proxyChain.anonymizeProxy(
          `http://${this.proxy.userName}:${this.proxy.password}@${this.proxy.proxy}:${this.proxy.port}`
        );
        const page = await this.puppeteerStart(newProxyUrl);
        // map condition
        if (!page) {
          return resolve(false);
        } else {
          let priceData;
          let seatDataLocal;
          page.page.on("response", async (response) => {
            if (this.price && this.seatData?.length > 0) {
              await page.browser.close().then(async (x) => {
                return resolve(true);
              });

              await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
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
          setTimeout(async () => {
            await page.browser.close();
            await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
            priceData = this.price;
            seatDataLocal = this.seatData;

            if (priceData && seatDataLocal.length > 0) {
              resolve(true);
            } else {
              console.log(`website is down`);
              resolve(false);
            }
          }, 40000);
        }
      });
      return promise;
    } catch (error) {
      console.log("error: ", error.message);
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
}
