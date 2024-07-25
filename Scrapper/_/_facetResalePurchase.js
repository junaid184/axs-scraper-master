
import { createRequire } from 'module';
import _ from 'lodash'
import { json } from 'stream/consumers';
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-extra");
const StelthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StelthPlugin());
const { executablePath } = require('puppeteer');
import fetch from 'cross-fetch';
import PuppeterActor from '../puppeterActor.js';
import { v4 as uuidv4 } from 'uuid';


export default class Actor {

  header = null;
  dataToPost = [];
  file = 0;
  countFile = 0;
  setHeader = async (_page) => {

    if(this.header==null)
    {
      let _actor = new PuppeterActor(_page.eventUrl);
      const dataGet = await _actor.start();
    if (dataGet == true) {

      this.header = await _actor.getHeader();
      return true;
    }
    else {
      return false;
    }
    }

  } 
  async StartScraping(_page, file) {

   return new Promise(async (resolve, reject)=>{
    this.dataToPost=[];
    this.file = file;
    this.countFile += 1;
    if (this.countFile >20) {
      
      this.countFile=0;
      console.log(this.countFile,"count");
      this.header = null
    }
    if (this.header == null) {
      await this.setHeader(_page);
        }
        let updatedURL=`https://services.ticketmaster.com/api/ismds/event/${_page.eventId}/facets?by=shape+attributes+available+accessibility+placeGroups+inventoryTypes+offertypes+description+accessibility+offers+section+priceLevelSecnames+ticketTypes&embed=area&embed=offer&embed=description&q=available&show=listpricerange+places+maxQuantity+sections&resaleChannelId=internal.ecommerce.consumer.desktop.web.browser.ticketmaster.us&apikey=b462oi7fic6pehcdkzony5bxhe&apisecret=pquzpfrfz7zd2ylvtz3w5dtyse`;
        try {
          await this.fetchData(updatedURL)
           
       }
       catch (e) {
         console.log(e, "failed");
         this.header = null;
         while (this.header == null) {
   
           if (await this.setHeader(_page) == true);
           {
             if (this.header != null) {
                await this.fetchData(updatedURL)
             }
           }
         }
       }

     let dataG= await this.saveToStream();
       if(dataG==true)
       {
        resolve(true);
       }
       else
       {
        resolve(false);
       }
    }) 
  }

  async fetchData(updatedURL) {
     return await fetch(updatedURL, {
      method: "GET",
      headers: {
       
        "Connection": "keep-alive",
        "User-Agent":  this.header.userAgent,
        "TMPS-Correlation-Id":  "8f21366c-9ad4-4a1b-abe3-ef3a3a4315b6",
        "Accept":  "*/*",
        "Origin":  "https://www.ticketmaster.com",
        "Sec-Fetch-Site":  "same-site",
        "Sec-Fetch-Mode":  "cors",
        "Sec-Fetch-Mode":  "cors",
        "Sec-Fetch-Dest":  "empty",
        "Referer":  "https://www.ticketmaster.com/",
        "Accept-Encoding":  "gzip, deflate, br",
        "Accept-Language":  "en-US,en;q=0.9",
        "Cookie": this.header.cookie
      }
    }).then(async y => {
      console.log("Pushed");
      if (y.status == 200) {
        let dataGet = await y.json();

        this.dataToPost.push(dataGet); 

      }
      else {

        this.header = null

      }

    }).catch(x => {
      console.log("error", x);
    })
  }




  async saveToStream() {
    return new Promise(async (resolve, reject)=>{
      let a =this.dataToPost.length>0?this.dataToPost[0]:[];
     
      if(a?._embedded?.offer)
      {
        a=a?._embedded?.offer.map(x=>{
         let seats=_.range([parseInt(x.seatFrom)], parseInt(x.seatTo)+1, [1]);
          return {
            ...x,
            seats:[seats],
            id: uuidv4(),
            seatCounts:seats.length
          }
        })
      }
      let finalDataToPush = [];
      
      
      finalDataToPush = [..._.orderBy(a, ['seatCounts'], ['desc'])];
     

       
 
for (let i = 0; i < finalDataToPush.length; i++) {

  finalDataToPush[i]?.seats.map((z) => {
     z.map(y => {
        finalDataToPush.filter((g) => g != undefined && finalDataToPush[i].id != g.id).map((g) => {
        g?.seats.map(h => {
          if (h.includes(y) && g.section==finalDataToPush[i]?.section && g.row==finalDataToPush[i].row) {
            {
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");
              finalDataToPush = finalDataToPush.map(s => {
                if (s?.id == g?.id) {
                  return undefined;
                }
                else {
                  return s;
                }
              })

            }
          }
        });
      });
    })
  });
}
 
      /*
     
      console.log(finalDataToPush.length, "before");
      for (let i = 0; i < finalDataToPush.length; i++) {
        finalDataToPush[i]?.seats.map((z) => {
          z.map(y => {
            finalDataToPush.filter((g) => g != undefined && finalDataToPush[i].id != g.id).map((g) => {
              g?.seats.map(h => {
                if (h.includes(y)) {
                  {
                    finalDataToPush = finalDataToPush.map(s => {
                      if (s?.id == g?.id) {
                        return undefined;
                      }
                      else {
                        return s;
                      }
                    })
  
                  }
                }
              });
  
            });
          })
        });
      }
      
      */
      // finalDataToPush.map(x=>console.log(x));
   
 
      finalDataToPush = finalDataToPush.map(x => {
  
         if (x) {
          let faceValue = x?.faceValue * x?.seats[0].length;
          let totalPrice =x?.totalPrice * x?.seats[0].length;
          let listValue = totalPrice + (totalPrice * (20 / 100));
  
          let extraCost = totalPrice - (x?.noChargesPrice);
          let groupExtraCost = extraCost * x?.seats.length;
          return {
            "eventId": "",
            "quantity": x?.seats.length,
            "seats": x?.seats,
            "section": x?.section,
            "row": x?.row,
            "lowSeat": x?.seats[0][0],
            "highSeat": x?.seats[0][x?.seats.length - 1],
            "stockType": "HARD",
            "lineType": "PURCHASE",
            "seatType": "CONSECUTIVE",
            "inHandDate": "",
            "faceCost": faceValue,
            "listPrice": listValue,
            "extraCost": extraCost,
            "groupExtraCost": groupExtraCost,
            "groupCost": totalPrice,
            "seatTypeByTicketMaster": x?.offerType,
            "internalNotes": "",
            "tags": "",
            "hideSeatNumber": true,
            "ticketMasterEventId": ""
          }
        }
        else
          return undefined;
      }).filter(x => x != undefined)
  
  
      let dataPost = {
        "vendorId": 32205,
        "internalNotes": "+stub +geek +tnet +vivid +tevo +pick",
        "hideSeatNumber": "true",
        "tags": "ATM",
        "lines": finalDataToPush.filter(x=>x.row!=undefined).map(x => {
          return {
            "amount": 0,
            "lineItemType": "INVENTORY",
            "inventory": {
              "quantity": x?.quantity,
              "section": x?.section,
              "row": x?.row,
              "cost": 0,
              "seats": x?.seats[0],
              "eventId": "3935620",
              // "lowSeat": x?.lowSeat,
              // "highSeat": x?.highSeat,
              "stockType": "HARD",
              "lineType": "PURCHASE",
              "seatType": "CONSECUTIVE",
              "inHandDate": "2023-05-18",
              "tickets": x?.seats[0].map(y => {
                return {
                  "id": 0,
                  "seatNumber": y,
                  "section": x?.section,
                  "row": x?.row,
                  "notes": "string",
                  "cost": 0,
                  "faceValue": 0,
                  "taxedCost": 0,
                  "sellPrice": 0,
                  "stockType": "HARD",
                  "eventId": 0,
                  "accountId": 0,
                  "status": "AVAILABLE",
                  "createdDate": "2023-05-13T19:39:52.285",
                  "createdBy": "string",
                  "lastUpdate": "2023-05-13T19:39:52.285",
                  "lastUpdateBy": "string",
                  "dateCancelled": "2023-05-13T19:39:52.285",
                  "cancelledByUserId": 0,
                  "auditNote": "string"
                }
              })
              ,
              "notes": "+stub +geek +tnet +vivid +tevo +pick",
              "tags": "ATM"
            }
          }
        })
  
      }
      
  
      
  
  
  
  
      // fetch("https://skybox.vividseats.com/services/purchases", {
      //   method: "post",
      //   headers: {
      //     "X-Application-Token": "669a1098-3896-4a39-95af-a22f7313000b",
      //     "X-Api-Token": "e0e69eab-7964-4b02-9504-d0587005b487",
      //     "X-Account": "337"
      //   },
  
      //   //make sure to serialize your JSON body
      //   body: dataPost
      // })
      //   .then((response) => {
      //     console.log(response,"done");
      //     //do something awesome that makes the world a better place
      //   });
  
      fs.writeFile(this.file + "output.json", JSON.stringify(a), 'utf8', async function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
  
        console.log("JSON file has been saved.");
        resolve(true);
      });
    });
   
    
  }



}

