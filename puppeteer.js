import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin);
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export default class PuppeteerActor {
  price = null;
  seatData = null;
  url = null;
  constructor(_url) {
    this.url = _url;
  }
  

  start = async () => {
    return await this.setData();
  };

  setData = async () => {
    try {
      let promise = new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewpageort: null,
          args: ["--start-maximized"],
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
          username: "hUcQAPJHOQ",
          password: "A9uag6GWnY",
        });
        await page.goto(this.url, {
          waitUntil: "load",
          timeout: 0,
        });
        const button = await page.$(`#POP_UP_MODAL > div > div > div.modal-main > div.modal-footer > div > div > button`);
        if(button) // notice popup button click condition
        {
          await button.click();
        }
      const innerText = await page.evaluate(()=>{
        const element = document.querySelector(`#main > div > div > div.layout > div > div > div > div > div > div > div > div > article > aside > div > section > div.sc-jRGJub.gpfqxZ > h1`);
        return element ? element.innerText : null;
      })
      if(innerText === "Pick Your Tickets on Map") // map condition
      {
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
      }
      const element = page.$(`div[class="sc-efNZxp cCzpTs"]`);
      if(element) // tickets prices on left side condition
      {
        const elements = await page.$$('div[class="sc-efNZxp cCzpTs"]'); // Target exact class string

        const allText = [];
        for (const element of elements) {
          const text = await element.innerText();
          allText.push(text);
        }
      
        console.log('Text for elements with class "sc-efNZxp cCzpTs":', allText);
      }
        setTimeout(() => {
          browser.close();
          resolve(false);
        }, 40000);
      });
      return promise;
    } catch (error) {
      console.log("error: ", error.message);
      await browser.close().then((x) => {
        return resolve(false);
      });
      return resolve(false);
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
