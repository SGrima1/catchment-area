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

    // PropertyDATA API
  
  // retrieve Outcodes
  // fetch data from url and return selection
  const fetchPropertyData = async (url, outcode) => {
    const response = await fetch(url)
    try {
    const resultObject = await response.json()
    return {Outcode: outcode,
            Value_2021: resultObject.data[5][1].toLocaleString(),
            Increase_2019: resultObject.data[3][2],
            Increase_2020: resultObject.data[4][2],
            Increase_2021: resultObject.data[5][2]} 
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
    const propertyDataGlobal = await returnPropertyData();
    console.log(propertyDataGlobal);
    
      // Extract Values into DOM tables

  ``  // EXTRACT VALUE FOR HTML HEADER 
    const header = Object.keys(propertyDataGlobal[0]);  

    // CREATE DYNAMIC TABLE.
    const table = document.getElementById("value_table");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
    // let tr = table.insertRow(-1);                   // TABLE ROW.
    // for (let i = 0; i < header.length; i++) {
    //     const th = document.createElement("th");      // TABLE HEADER.
    //     th.innerHTML = header[i].replace('_', ' ');
    //     if ( i == 0) { th.classList.add('outcode');}
    //     tr.appendChild(th);
    // }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (let i = 0; i < propertyDataGlobal.length; i++) {

        let tr = table.insertRow(-1);

        for (let j = 0; j < header.length; j++) {
            let tabCell = tr.insertCell(-1);
            if (j == 1){
              tabCell.innerHTML = propertyDataGlobal[i][header[j]]
              tabCell.classList.add('value');  
            } else {
              tabCell.innerHTML = propertyDataGlobal[i][header[j]] 
            };
            if ( j == 0) { tabCell.classList.add('outcode');}
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    // const divContainer = document.getElementById("sold_values");
    // divContainer.innerHTML = "";
    // divContainer.appendChild(table);
    
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
      let value_2021 = propertyDataGlobal.find(x => x.Outcode == polygon.properties.name).Value_2021
      let increase_2021 = propertyDataGlobal.find(x => x.Outcode == polygon.properties.name).Increase_2021
      const element = document.querySelector('#map_box')
      const htmlValue = `
      <h3>${polygon.properties.name} </h3>
      <div class="Metrics"> 
        Average House Value 2021: ${value_2021}
        <br> Residential Value Increase 2021: ${increase_2021}
      </div>
      `
      L.geoJson(polygon, {
          style: polygonStyle
      }).bindTooltip(polygon.properties.name, {
        permanent: true, 
        direction: 'center',
        interactive: true // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
      })
      .on('click', function(event) {
        // element.innerHTML = ""
        element.innerHTML = htmlValue
        element.classList.toggle("hide")
      }).addTo(map)
    })  

    client.polygons.fetch(sources, options).then((result) => {
      L.geoJson(result, {
          style: catchmentStyle
      }).addTo(map);
  });
}

export { initIsoMap };