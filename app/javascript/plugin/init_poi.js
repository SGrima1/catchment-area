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
  
  // remove duplicates function

  
  // retrieve all asociated postcodes
  async function getFromAPI() {
    let outcodes = []
    pois.features.forEach((poi) => { 
      let url = `https://api.postcodes.io/outcodes?lon=${poi.geometry.coordinates[0]}&lat=${poi.geometry.coordinates[1]}&limit=1`
      fetch(url)
        .then(response => response.json())
        .then((data) => {    
          outcodes.push(data.result[0].outcode);
          
      });

    });
    return outcodes;
  }
  
  async function removeOutcodeDuplicate() {
    const outcodesDup = await getFromAPI();
    return outcodesDup
  }

  const outcodesGlobal = await removeOutcodeDuplicate();
  console.log(outcodesGlobal)
};
 
export { initPois }; 