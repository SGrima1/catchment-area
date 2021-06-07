const initPois = async () => {
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
  const fetchPropertyData = async (url) => {
    const response = await fetch(url)
    const resultObject = await response.json()
    return [resultObject.postcode, resultObject.data[3],resultObject.data[4] ,resultObject.data[5]] 
    }
    
    // loop through postcodes.io urls and push them into array
    const propertyData = []
    const loopPropertyData = async () => {
    for (const outcode of outcodesGlobal ){
      let url = `https://api.propertydata.co.uk/growth?key=TFRGZDENV6&postcode=${outcode}`
        const result = await fetchPropertyData(url)
        propertyData.push(result)
      }
      return propertyData
    }
    // return array and manipulate it - return manipulation
    const returnPropertyData = async () => {
      const data = await loopPropertyData();
      return data
    }
  
    const propertyDataGlobal = await returnPropertyData()
    console.log(propertyDataGlobal)

}
 
export { initPois }; 