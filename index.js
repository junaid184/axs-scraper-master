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
import { sendMapInventoryData } from "./Scrapper/helpers/seatDataFilter.js";
import { sendInventory } from "./Scrapper/helpers/seatDataFilterSidebar.js";
import fs from "fs";
export async function getData(page) {
  return new Promise(async (resolve, reject) => {
    let _actor = new PuppeteerActor(
      page.url,
      page.isMap,
      page.isModal,
      page.isSideBar,
      page.isPage
    );

    const dataGet = await _actor.start();

    if (dataGet == true && page.isMap) {
      let seatData = await _actor.getSeatData();

      let priceData = await _actor.getPriceData();

      if (priceData && seatData) {
        await sendMapInventoryData(seatData, priceData.offerPrices);
      }
    }
    if (dataGet == true && page.isSideBar) {
      let seatData = await _actor.getSeatData();
      if (seatData) {
        await sendInventory(seatData);
      }
    }
    if (dataGet == true && page.isPage) {
      let data = await _actor.getDataFromPage();

      console.log(data);

      if (data) {
        // TODO:  send inventory
        fs.writeFile(`page.json`, JSON.stringify(data), (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("File successfully written!");
          }
        });
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
          url: "https://tix.axs.com/OBd3FAAAAAAikceTAwAAAABh%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fA2F4cwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d?skin=&tags=&cpch=&cpdate=&cprid=&cpid=&cpcn=&cpdid=&cpdn=&cpsrc=&intoff=&cid=&utm_source=&utm_medium=&utm_campaign=&utm_term=&utm_content=&aff=&clickref=&q=00000000-0000-0000-0000-000000000000&p=a9a9a0c9-9895-4da8-89f9-709eba99b6cb&ts=1722521567&c=axs&e=34334904860016529&rt=AfterEvent&h=939800282776776eafc8ec66a9105bb4",
          isModal: true,
          isSideBar: false,
          isMap: false,
          isPage: true,
          axsEventId: "antshant",
        },
        // {
        //   url: "https://tix.axs.com/qyNwCQAAAACjZbV%2fAAAAAAAS%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBXRoZW1lAP%2f%2f%2f%2f%2f%2f%2f%2f%2f%2f/shop/marketplace?locale=en-US&axssid=rnku1ao0eju5m2cgqi6mpeqaqq&originalReferringURL=https%3A%2F%2Fwww.axs.com%2Fsearch%3Fq%3Dbaseball&preFill=1&eventid=515796&src=AEGAXS1_WMAIN&fbShareURL=www.axs.com%2Fevents%2F515796%2Ftoronto-blue-jays-at-new-york-yankees-baseball-card-pack-giveaway-tickets%3F%26ref%3Devs_fb&t_originalReferringURL=https%3A%2F%2Fwww.axs.com%2F&_gl=1*w0p8kz*_gcl_au*MjA1MDE1NjQ5Mi4xNzIyNDM4MjY2*_ga*ODk4NTAyNzQ5LjE3MjI0NDA0NjI.*_ga_D0FS4F37VT*MTcyMjQ0MDQ2Mi4xLjEuMTcyMjQ0MDQ2Ny41NS4wLjA.",
        //   isModal: false,
        //   isSideBar: true,
        //   isMap: false,
        //   axsEventId: "antshant",
        // },
        // {
        //   url: "https://tix.axs.com/vYAtIwAAAABUbxRFAwAAAACL%2fv%2f%2f%2fwD%2f%2f%2f%2f%2fBmNyeXB0bwD%2f%2f%2f%2f%2f%2f%2f%2f%2f%2fw%3d%3d/shop/search?q=00000000-0000-0000-0000-000000000000&p=2e09ac49-9990-463f-a989-0c9b4f93ede9&ts=1720718895&c=axs&e=5901846375512996123&rt=AfterEvent&h=5e58ead52755cea99a5081deb6353578",
        //   isModal: false,
        //   isSideBar: false,
        //   axsEventId: "antshant",
        //   isMap: true,
        // },
      ];
      for (const page of events) {
        await getData(page);
      }
      // process.abort();
    }
  };
  startPropgram();
} catch (e) {
  console.log("main error: ", e);
}
