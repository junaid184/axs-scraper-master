import fs from 'fs';
export const sendInventory = async (data) => {
  try {
    console.log(data, "side barr data successfull");
    fs.writeFile(`sideBar.json`, JSON.stringify(data, null, 2), (err) =>{
      if(err)
        {
          console.error('Error writing file:', err);
        } else {
          console.log('File successfully written!');
        }
    });
    //TODO: send the inventory to API
  } catch (error) {
    console.log(`error in sending inventory from side bar: `, error);
  }
};
