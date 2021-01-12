const initTargomo = () => {
  
  const mapData = document.getElementById("map")
  async function initMap() {
    
    

    // create targomo client
    const client = new tgm.TargomoClient('britishisles',  mapData.dataset.targomoApiKey );
    
    // Coordinates to center the map
    const myLatlng = new google.maps.LatLng(51.52145636448061, -0.00036176365407112845);

    // define the map
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12, disableDefaultUI: true, zoomControl: true,
        center: myLatlng,
      });

      

    var mapType = new google.maps.StyledMapType([{
        featureType: "all", elementType: "all",
        clickableIcons: false, draggableCursor:'',stylers: [ { saturation: -100 } ]}
    ], { name:"Grayscale" });    
    map.mapTypes.set('grayscale', mapType);
    map.setMapTypeId('grayscale');

    // init the first marker
    const marker = new google.maps.Marker({
        position: myLatlng,
        map: map
    });

    // polygons time rings
    const travelTimes = [300, 600, 900, 1200, 1500, 1800];

    // you need to define some options for the polygon service
    const options = {
        travelType: 'car',
        travelEdgeWeights: travelTimes,
        maxEdgeWeight: 1800,
        edgeWeight: 'time',
        serializer: 'json'
    };

    // define the starting point
    const sources = [{ id: 0, lat: myLatlng.lat(), lng: myLatlng.lng() }];

    // define the polygon overlay
    const layer = new tgm.googlemaps.TgmGoogleMapsPolygonOverlay(map, {
        strokeWidth: 20
    });

    // get the polygons
    const polygons = await client.polygons.fetch(sources, options);
    // calculate bounding box for polygons
    const bounds = polygons.getMaxBounds();
    // add polygons to overlay
    layer.setData(polygons);
    // zoom to the polygon bounds
    map.fitBounds(new google.maps.LatLngBounds(bounds.southWest, bounds.northEast), 0);
  }

  google.maps.event.addDomListener(window, 'load', initMap)
};

export { initTargomo };