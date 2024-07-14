import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin);
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
async function start() {
  try {
    puppeteer
      .launch({
        headless: false,
        defaultViewpageort: null,
        args: ["--start-maximized"],
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        userDataDir:
          "C:/Users/mohsi/AppData/Local/Google/Chrome/User Data/Default",
      })
      .then(async (browser) => {
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
        await page.goto(
          "https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578",
          {
            waitUntil: "load",
            timeout: 0,
          }
        );
        page.on("response", async (response) => {
          try {
            const url = response.url();
    
            // Filter out OPTIONS requests
            if (!response.ok() || response.request().method() === "OPTIONS") {
              return;
            }
    
            if (url.includes("/offer/search?flow=pick_a_seat_2d&utm_cid")) {
              console.log(url);
              const jsonResponse = await response.json();
              console.log(`response:`, jsonResponse.offers[0].items[0]);
            }
          } catch (error) {
            console.error("Error in response event handler:", error.message);
          }
          
        });
      });
  } catch (error) {
    console.log("error: ", error.message);
  }
}
start();
