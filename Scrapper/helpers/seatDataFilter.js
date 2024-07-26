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
const fetchingItemsFromMapSeat = async (data) => {
  try {
    let items = [];
    for (const iterator of data) {
      for (const item of iterator.items) {
        items.push(item);
      }
    }
    return items;
  } catch (error) {
    console.log("fetcing items from map seat error: " + error);
  }
};
const mergByRows = async (items) => {
  try {
    const groupSeats = items.reduce((acc, item) => {
      const key = `${item.sectionID}-${item.rowID}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);

      return acc;
    }, {});

    const groupedSeatsArray = Object.values(groupSeats).flat();
    const combinedSeats = groupedSeatsArray.reduce((acc, seat) => {
      if (seat) {
        const key = seat.rowLabel;
        if (!acc[key]) {
          acc[key] = {
            sectionLabel: seat.sectionLabel,
            rowLabel: seat.rowLabel,
            seats: [seat.number],
            // price: seat.price,
          };
        } else {
          if (!acc[key].seats.includes(seat.number)) {
            acc[key].seats.push(seat.number);
          }
        }
        return acc;
      }
    }, {});
    const combinedSeatsArray = Object.values(combinedSeats);
    console.log("combine array: ", combinedSeatsArray);
  } catch (error) {
    console.log("merging items from map seat error: " + error);
  }
};
const filterMapSeatData = async (data) => {
  const items = await fetchingItemsFromMapSeat(data);
  //   finalData = await mergByRows(items);
  return items;
};
const attatchPrice = async (seatData, priceData) => {
  try {
    let finalData = seatData;
    for (const iterator of finalData) {
      let price = await findPrice(
        iterator.offerID,
        iterator.priceLevelID,
        priceData
      );

      iterator.price = price;
    }

    return finalData;
  } catch (error) {
    console.log(`error at attatching the price: ${error}`);
  }
};
const attatchMapPriceOnSeat = async (seatData, data) => {
  const attachedPrice = await attatchPrice(seatData, data);

  return attachedPrice;
};
export const sendMapInventoryData = async (seatData, priceData) => {
  const finalSeatData = await filterMapSeatData(seatData);

  const dataWithPrice = await attatchMapPriceOnSeat(finalSeatData, priceData);

  const mergedData = await mergByRows(dataWithPrice);
  //send post request to inventory API
};
