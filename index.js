import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import proxyChain from "proxy-chain";
puppeteer.use(StealthPlugin);
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
async function start() {
  try {
    const oldProxyUrl = "http://OR1657325346:r2uyMQp1@208.194.204.241:7023";
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

  // Prints something like "http://127.0.0.1:45678"
  console.log(newProxyUrl);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewpageort: null,
    args: ["--start-maximized"],
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    userDataDir: "C:/Users/hp/AppData/Local/Google/Chrome/User Data/Default",
  });

  // Do your magic here...
  const page = await browser.newPage();
  const { width, height } = await page.evaluate(() => {
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  });

  // Set the viewport to the screen dimensions
  await page.setViewport({ width, height });
  await page.authenticate({'username':'OR1657325346', 'password': 'r2uyMQp1'});
  await page.goto(
    "https://tix.axs.com/YOHNEQAAAAAkBto0AgAAAADz%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fDktlc3dpY2tUaGVhdHJlAP%2f%2f%2f%2f%2f%2f%2f%2f%2f%2f/shop/search?locale=en-US&axssid=csfo0suotsp1c3nuot4rifg8qj&originalReferringURL=https%3A%2F%2Fwww.axs.com%2Fevents%2F564913%2Fbob-the-drag-queen-tickets&preFill=1&eventid=564913&ec=KTP241010&src=AEGAXS1_WMAIN&skin=axs_keswick&fbShareURL=www.axs.com%2Fevents%2F564913%2Fbob-the-drag-queen-tickets%3F%26ref%3Devs_fb&_gl=1*14d1aly*_ga*OTUzMjQ4NDM5LjE3MTkzMjc5OTU.*_ga_D0FS4F37VT*MTcyMDE3OTkzMi4xMi4xLjE3MjAxODEwOTYuNDAuMC4w"
  );
  await page.waitForSelector(`#main > div > div > div.layout > div > div > div > div > div > div > div > div > article > section > div.sc-gIEZMH.enjNBJ > div.sc-cQCQeq.fAGedl.seatmap-viewer > div > div.d2m-layers.d2m-content-layer.d2m-map-layer`)
  // Select the inner element using page.$eval
   // Check if the element exists and get its HTML content
   await page.waitForSelector(`#main > div > div > div.layout > div > div > div > div > div > div > div > div > article > section > div.sc-gIEZMH.enjNBJ > div.sc-cYYuRe.IjLoE.minimap-2d > div > div.d2m-layers.d2m-content-layer.d2m-map-layer`)
    // Select the parent div with the specified class
    await delay(30000)
   
  const parentDivSelector = 'div[class="sc-cQCQeq fAGedl seatmap-viewer"]';
  
  // Wait for the parent div to be present
  await page.waitForSelector(parentDivSelector);

  // Get all child elements of the parent div
  const childElements = await page.$$(`${parentDivSelector} *`);
console.log("child elements: ",childElements.length);
  // Hover over each child element
  const first_element = childElements[childElements.length - 1];
  first_element.click();
  for (let element of childElements) {
    try
    {
      await element.hover();
      await delay(2000); // Optional: Add a delay between hovers
    }
    catch(e)
    {
      console.log(`error in loop:`, e.message);
      continue;
    }
    
  }
  // await browser.close();

  // Clean up
  // await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
  } catch (error) {
    console.log("error: ",error.message);
  }
  
}
start()