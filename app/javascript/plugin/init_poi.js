const initPois = async () => {
  const mapData = document.getElementById("map")
  const markerData = JSON.parse(mapData.dataset.marker)
  
  const client = new tgm.TargomoClient("britishisles", mapData.dataset.targomoApiKey);
  
  const lnglat = [markerData.lng,markerData.lat];
  const options = {
    maxEdgeWeight: 900,
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
  // fetch data from url
  const asynchronousFunction = async (url) => {
  const response = await fetch(url)
  const resultObject = await response.json()
  return resultObject.result[0].outcode
  }
  
  // loop through postcodes.io urls and push them into array
  const outcodes = []
  const mainFunction = async () => {
  for (const poi of pois.features ){
    let url = `https://api.postcodes.io/outcodes?lon=${poi.geometry.coordinates[0]}&lat=${poi.geometry.coordinates[1]}&limit=1`
    
      const result = await asynchronousFunction(url)
      outcodes.push(result)
    }
    return outcodes
  }
  // return array and manipulate it - return manipulation
  const returnArray = async () => {
    const outcodesDup = await mainFunction();
    const uniq = [...new Set(outcodesDup)];
    console.log(uniq)
  }
  returnArray()
  

}
 
export { initPois }; 