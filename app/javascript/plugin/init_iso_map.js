// create targomo client
const initIsoMap = async() => {
    const mapData = document.getElementById("map")
    const markerData = JSON.parse(mapData.dataset.marker)
    const client = new tgm.TargomoClient('britishisles',  mapData.dataset.targomoApiKey);
    
    // GET OUTCODES THROUGH RANDOM POIs COORDINATES WITHIN CATCHMENT AREA
 
    const lnglat = [markerData.lng,markerData.lat];
    const optionsPOI = {
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
    { id: 0, lat: lnglat[1], lng: lnglat[0] }, optionsPOI
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

    // Fetch OUTCODE POLYGONS

    const fetchPolygonData = async (url, outcode) => {
        const response = await fetch(url)
        const resultObject = await response.json()
        return resultObject.features.find(x => x.properties.name == outcode )
    }
    // loop through postcodes.io urls and push them into array
    const polygons = []
    const loopPolygonData = async () => {
    for (const outcode of outcodesGlobal ){
      let url = `/PostcodeDistricts.geojson`
        const result = await fetchPolygonData(url, outcode)
        polygons.push(result)
     }
      return polygons
    }
    // return array and manipulate it - return manipulation
    const returnPolygon = async () => {
      const polygonsDup = await loopPolygonData();
      const filtered = polygonsDup.filter(Boolean) 
      return filtered
    }
  
    const polygonsGlobal = await returnPolygon()
    


    // Create a Leaflet map with basemap, set the center of the map to the city center of Berlin.
    const tilesUrl = 'https://api.maptiler.com/maps/positron/{z}/{x}/{y}@2x.png?key=IW4YyZ0SNyKtwkmSWnlc'
    const tileLayer = L.tileLayer(tilesUrl, {
        tileSize: 512, zoomOffset: -1,
        minZoom: 1, crossOrigin: true
    });
    var map = L.map('map_leaflet', {
        layers: [tileLayer],
        scrollWheelZoom: false
    }).setView([markerData.lat, markerData.lng], 14);
    const attributionText = `<a href="https://www.targomo.com/developers/resources/attribution/" target="_blank">&copy; Targomo</a>`;
    map.attributionControl.addAttribution(attributionText);

    // Define a source location which is passed into the Targomo polygon service.
    const sources = [{ id: 1, lat: markerData.lat, lng: markerData.lng }];

    // Add markers for the sources on the map.
    sources.forEach(source => {
        L.marker([source.lat, source.lng]).addTo(map)
    });

    // Set the traveloptions and options for the polygon service here. The `serializer` property tells the Targomo services to return geojson.
    const options = {
        travelType: 'car',
        travelEdgeWeights: [900],
        srid: 4326,
        buffer: 0.0005,
        serializer: 'geojson'
    };

    // Request polygons once immediately on page load and immediately add it to the map using the default geojson map layer.
    // Check out https://leafletjs.com/examples/geojson/ for more information on how to style the geojson in Leaflet.
    client.polygons.fetch(sources, options).then((result) => {
        L.geoJson(result, {
        }).addTo(map);
    });

    polygonsGlobal.forEach(polygon => {
        L.geoJson(polygon).addTo(map)
    })

    
  
}

export { initIsoMap };