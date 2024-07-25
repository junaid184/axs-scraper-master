import PuppeteerActor from "./Scrapper/puppeteer.js";
import {
  fetchAgents,
  fetchProxies,
  fetchScrapping,
  postHeaders,
  postSeats,
} from "./Scrapper/API.js";
import proxy from "./Scrapper/settings/proxy.js";
import agent from "./Scrapper/settings/userAgents.js";
let secTime = [60, 120, 140, 160, 170];
export async function getData(url) {
  const findPrice = async (offerID, priceLevelID, offerData) => {
    for (const offer of offerData) {
      // Check if the current offer matches the offerID

      if (offer.offerID == offerID) {
        // Loop through zonePrices to find the matching priceLevelID
        for (const zonePrice of offer.zonePrices) {
          for (const priceLevel of zonePrice.priceLevels) {
            if (priceLevel.priceLevelID === priceLevelID) {
              // Return the price found
              return priceLevel.prices[0].base; // Assuming there's only one price object
            }
          }
        }
      }
    }
    // If no price is found, return null or handle accordingly
    return null;
  };
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      let headerSet = false;
      let attempts = 0;
      while (headerSet === false && attempts < 3) {
        let _actor = new PuppeteerActor(
          url
        );

        const dataGet = await _actor.start();

        if (dataGet == true) {
          let seatData = await _actor.getSeatData();

          let priceData = await _actor.getPriceData();

          if (priceData && seatData) {
            console.log("seatData:  ", seatData[0].items[0]);
            const fetchedPrice = await findPrice(
              seatData[0].items[0].offerID,
              seatData[0].items[0].priceLevelID,
              priceData.offerPrices
            );
            console.log("price: ", fetchedPrice / 100);
            headerSet = true;
          }
        }
        attempts++;
      }

      if (headerSet == true) {
        return resolve(true);
      }
    }, 1000 * Math.floor(Math.random() * secTime.length));
  });
}

try {
  const startPropgram = async () =>
  {
    const { data: dataProxies, status: statusProxies } = await fetchProxies();
    
    if (statusProxies == 200) {
      proxy.proxies = dataProxies.data;
    }
    //Getting UserAgents
    const { data: dataUserAgents, status: statusAgents } = await fetchAgents();

    if (statusAgents == 200) {
      agent.UserAgent = dataUserAgents.data;
    }
    if (
      statusAgents == 200 &&
      statusProxies == 200 &&
      dataProxies.data.length > 0 &&
      dataUserAgents.data.length > 0
    ) {

    const events= [
      // "https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578",
      "https://tix.axs.com/G7gZEgAAAABlZEiPAAAAAAAc%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBXRoZW1lAP%2f%2f%2f%2f%2f%2f%2f%2f%2f%2f/shop/search?locale=en-US&axssid=mmfl92dgtpkfk1dtbs7bm0j6b0&originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&preFill=1&eventid=542323&ec=CCMH240802&src=AEGAXS1_WMAIN&fbShareURL=www.axs.com%2Fevents%2F542323%2Fkansas-21-event-tickets%3F%26ref%3Devs_fb&t_originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&_gl=1*pcsngv*_gcl_au*MTE0MzExMDc3LjE3MjE5Mjg5OTU.*_ga*MjMxNjc5NTQ4LjE3MjE5Mjg5ODE.*_ga_D0FS4F37VT*MTcyMTkyODk4MS4xLjEuMTcyMTkyODk5NS40Ni4wLjA."
    ]
    for (const url of events) {
     await getData(url);
    }
  }
  }
 startPropgram();
} catch (e) {
  console.log("main error: ", e);
}
