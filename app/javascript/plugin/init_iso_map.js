// create targomo client
const initIsoMap = async() => {
    const mapData = document.getElementById("map")
    const markerData = JSON.parse(mapData.dataset.marker)
    const client = new tgm.TargomoClient('britishisles',  mapData.dataset.targomoApiKey);
    
    // GET OUTCODES THROUGH RANDOM POIs COORDINATES WITHIN CATCHMENT AREA
    const lnglat = [markerData.lng,markerData.lat];
    const optionsPOI = {
      maxEdgeWeight: 900,
      travelType: "car",
      edgeWeight: "time",
      format: "geojson",
      osmTypes: [{
      key: "group",
      value: "cafe"
      }]
    };
  
    // retrieve all train stations within catchment-area
    const pois = await client.pois.reachable(
    { id: 0, lat: lnglat[1], lng: lnglat[0] }, optionsPOI
    );
    
    console.log(pois)
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
    // loop through polygons.geojson and push them into array
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

    var map = L.map('map').setView([markerData.lat, markerData.lng], 12);
    var gl = L.mapboxGL({
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e, Contains OS data \u00a9 Crown copyright and database right 2019",
        style: 'https://api.maptiler.com/maps/25b2c60e-dd4b-48c6-aa6a-feccb96014ca/style.json?key=IW4YyZ0SNyKtwkmSWnlc'
      }).addTo(map);

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
        buffer: 0.004,
        serializer: 'geojson'
    };

    // Request polygons once immediately on page load and immediately add it to the map using the default geojson map layer.
    // Check out https://leafletjs.com/examples/geojson/ for more information on how to style the geojson in Leaflet.
    const catchmentStyle = { 
        "color": "#88d4ab", 
        fillColor: "#88d4ab", 
        "fillOpacity": .5
    }
  
    const polygonStyle = { fillColor: '#ffffff', "fillOpacity": .01 }
    polygonsGlobal.forEach(polygon => {
        L.geoJson(polygon, {
            style: polygonStyle
        }).bindTooltip(polygon.properties.name, {
          permanent: true, 
          direction: 'center',
          interactive: true // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
        })
        .on('click', function(event) {console.log(polygon.properties.name)}).addTo(map)
    })  

    client.polygons.fetch(sources, options).then((result) => {
      L.geoJson(result, {
          style: catchmentStyle
      }).addTo(map);
  });
}

export { initIsoMap };