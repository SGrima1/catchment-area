// create targomo client
const initIsoMap = () => {
    const mapData = document.getElementById("map")
    const markerData = JSON.parse(mapData.dataset.marker)
    const client = new tgm.TargomoClient('britishisles',  mapData.dataset.targomoApiKey);
            
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
        travelType: 'walk',
        travelEdgeWeights: [600, 1200],
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
}

export { initIsoMap };