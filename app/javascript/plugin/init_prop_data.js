const initPropData = async () => {
  const mapData = document.getElementById("map")
  const markerData = JSON.parse(mapData.dataset.marker) 
  const client = new tgm.TargomoClient("britishisles", mapData.dataset.targomoApiKey);
  const lnglat = [markerData.lng,markerData.lat];
  const options = {
    maxEdgeWeight: 300,
    travelType: "car",
    edgeWeight: "time",
    format: "geojson",
    osmTypes: [{
    key: "railway",
    value: "station"
    }]
  };

  // retrieve all train stations within catchment-area
  const pois = await client.pois.reachable(
  { id: 0, lat: lnglat[1], lng: lnglat[0] }, options
  );
  
  // retrieve Outcodes
  // fetch data from url and return selection
  const fetchOutcodeData = async (url) => {
      const response = await fetch(url)
      const resultObject = await response.json()
      return resultObject.result[0].outcode
  }
  
  // loop through postcodes.io urls and push them into array
  const outcodes = []
  const loopPoiData = async () => {
  for (const poi of pois.features ){
    let url = `https://api.postcodes.io/outcodes?lon=${poi.geometry.coordinates[0]}&lat=${poi.geometry.coordinates[1]}&limit=1`
      const result = await fetchOutcodeData(url)
      outcodes.push(result)
    }
    return outcodes
  }
  // return array and manipulate it - return manipulation
  const returnOutcode = async () => {
    const outcodesDup = await loopPoiData();
    const uniq = [...new Set(outcodesDup)];
    return uniq
  }

  const outcodesGlobal = await returnOutcode()
  console.log(outcodesGlobal)

  // PropertyDATA API
  
  // retrieve Outcodes
  // fetch data from url and return selection
  const fetchPropertyData = async (url, outcode) => {
    const response = await fetch(url)
    try {
    const resultObject = await response.json()
    return {outcode: outcode,
            value_2019: resultObject.data[3][1],
            value_2020: resultObject.data[4][1],
            value_2021: resultObject.data[5][1],
            increase_2019: resultObject.data[3][2],
            increase_2020: resultObject.data[4][2],
            increase_2021: resultObject.data[5][2]} 
    } catch(err) {
      alert(`${outcode.outcode}/${outcode.district}: ${err}`)
    }
  }
    
    // loop through postcodes.io urls and push them into array
    const propertyData = []
    const loopPropertyData = async () => {
    for (const outcode of outcodesGlobal ){
      let url = `https://api.propertydata.co.uk/growth?key=TFRGZDENV6&postcode=${outcode}`
        const result = await fetchPropertyData(url, outcode)
        propertyData.push(result)
      }
      return propertyData
    }
    // return array and manipulate it - return manipulation
    const returnPropertyData = async () => {
      const data = await loopPropertyData();
      const filtered = data.filter(Boolean) 
      return filtered
    }
    const propertyDataGlobal = await returnPropertyData()
    console.log(propertyDataGlobal)

  // Extract Values into DOM tables

  // EXTRACT VALUE FOR HTML HEADER 
  const header = Object.keys(propertyDataGlobal[0]);  

  // CREATE DYNAMIC TABLE.
  const table = document.createElement("table");

  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
  let tr = table.insertRow(-1);                   // TABLE ROW.
  for (let i = 0; i < header.length; i++) {
      const th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = header[i];
      tr.appendChild(th);
  }

  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (let i = 0; i < propertyDataGlobal.length; i++) {

      tr = table.insertRow(-1);

      for (let j = 0; j < header.length; j++) {
          let tabCell = tr.insertCell(-1);
          tabCell.innerHTML = propertyDataGlobal[i][header[j]];
      }
  }

  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
  const divContainer = document.getElementById("sold_values");
  divContainer.innerHTML = "";
  divContainer.appendChild(table);

}
 
export { initPropData }; 