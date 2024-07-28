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
import {sendMapInventoryData} from "./Scrapper/helpers/seatDataFilter.js";
import { sendInventory } from "./Scrapper/helpers/seatDataFilterSidebar.js";
export async function getData(page) {
  
  return new Promise(async (resolve, reject) => {
    let _actor = new PuppeteerActor(
      page.url,
      page.isMap,
      page.isModal,
      page.isSideBar
    );

    const dataGet = await _actor.start();

    if (dataGet == true && page.isMap) {
      let seatData = await _actor.getSeatData();

      let priceData = await _actor.getPriceData();

      if (priceData && seatData) {
        await sendMapInventoryData(seatData, priceData.offerPrices); 
      }
      
    }
    if(dataGet == true && page.isSideBar)
    {
      let seatData = await _actor.getSeatData();
      if(seatData)
      {
     
        await sendInventory(seatData);
      }
    }
    return resolve(true);
  });
}

try {
  const startPropgram = async () => {
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
      const events = [
        {
          url: "https://tix.axs.com/qyNwCQAAAACD0Y5%2fAAAAAAB4%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBXRoZW1lAP%2f%2f%2f%2f%2f%2f%2f%2f%2f%2f/shop/marketplace?locale=en-US&axssid=9ov7mknoohe4idgnliqpc9o55g&originalReferringURL=https%3A%2F%2Fwww.axs.com%2Fbrowse%2Fsports&preFill=1&eventid=513854&src=AEGAXS1_WMAIN&fbShareURL=www.axs.com%2Fevents%2F513854%2Fsan-diego-padres-at-baltimore-orioles-tickets%3F%26ref%3Devs_fb&t_originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&_gl=1*1rz81p7*_gcl_au*MTQ2MTg3MTY0LjE3MjIxODAwMjk.*_ga*NzQ0OTY2NzI4LjE3MjIxODAwNzM.*_ga_D0FS4F37VT*MTcyMjE4MTYyMC4xLjEuMTcyMjE4MTgzNS4zOS4wLjA.",
          isMap: false,
          isModal: false,
          isSideBar: true,
        },
        {
          url: "https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578",
          isModal: false,
          isSideBar: false,
          isMap: true,
        },
        {
          url: "https://tix.axs.com/WbURFAAAAAAd%2bLiAAAAAAACT%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBXRoZW1lAP%2f%2f%2f%2f%2f%2f%2f%2f%2f%2f/shop/search?locale=en-US&axssid=9ov7mknoohe4idgnliqpc9o55g&originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&preFill=1&eventid=559969&ec=ROS240808&src=AEGAXS1_WMAIN&fbShareURL=www.axs.com%2Fevents%2F559969%2Fdonavon-frankenreiter-w-twam-tickets%3F%26ref%3Devs_fb&t_originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&_gl=1*gabxa9*_gcl_au*MTQ2MTg3MTY0LjE3MjIxODAwMjk.*_ga*NzQ0OTY2NzI4LjE3MjIxODAwNzM.*_ga_D0FS4F37VT*MTcyMjE4MTYyMC4xLjEuMTcyMjE4MTY4OC41Mi4wLjA.",
          isModal: false,
          isSideBar: false,
          isMap: true,
        },
      ];
      for (const page of events) {
        await getData(page);
      }
    }
  };
  startPropgram();
} catch (e) {
  console.log("main error: ", e);
}
