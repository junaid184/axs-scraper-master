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

const filterMapSeatData = async (data) => {
  let finalData = [];

  return finalData;
};

const attatchMapPriceOnSeat = async (seatData, data) => {
  let finalData = [];

  
  return finalData;
};
export const sendMapInventoryData = async (seatData, priceData) => {
  const finalSeatData = await filterMapSeatData(seatData);

  const finalData = await attatchMapPriceOnSeat(finalSeatData, priceData);

  //send post request to inventory API
};
