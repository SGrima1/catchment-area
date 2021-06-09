const initStats = () => {
  window.onload = function () {
    const mapData = document.getElementById("map_hide")
    const markerData = JSON.parse(mapData.dataset.marker)
    const chartContainer = document.getElementById('chart');
    chartContainer.style.height = chartContainer.clientHeight + 'px';

    // create targomo client
    const client = new tgm.TargomoClient('britishisles',  mapData.dataset.targomoApiKey );
    // Coordinates to center the map
    const myLatlng = new google.maps.LatLng(markerData.lat, markerData.lng);
    const lnglat = [markerData.lng, markerData.lat];

    const attributionText = `<a href="https://www.targomo.com/developers/resources/attribution/" target="_blank">&copy; Targomo</a>`;;

    // set the progress bar
    const pBar = new mipb({ fg: "#FF8319" });

    // add the map and set the initial center to berlin
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/positron/style.json?key=IW4YyZ0SNyKtwkmSWnlc',
        zoom: 12,
        center: lnglat,
        attributionControl: false
    })
        .addControl(new mapboxgl.NavigationControl())
        .addControl(new mapboxgl.AttributionControl({ compact: true, customAttribution: attributionText }));

    // disable scroll zoom
    map.scrollZoom.disable();

    const marker = new mapboxgl.Marker({
        draggable: true
    }).setLngLat(lnglat).addTo(map);

    marker.on('dragend', getStats);

    const stats = {
        group: 52,
        individual: [
        {
        id: 0, name: "Population", label: "Total population",
        colors: ["rgba(26,152,80,1)", "rgba(145,207,96,1)", "rgba(217,239,139,1)", "rgba(254,224,139,1)", "rgba(252,141,89,1)", "rgba(215,48,39,1)"]
        },
        {
        id: 14, name: "Population_30-44", label: "Population 30 to 44",
        colors: ["rgba(26,152,80,0.5)", "rgba(145,207,96,0.5)", "rgba(217,239,139,0.5)", "rgba(254,224,139,0.5)", "rgba(252,141,89,0.5)", "rgba(215,48,39,0.5)"]
        }
        ],
        weights: [300, 600, 900, 1200, 1500, 1800],
        colors: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'].reverse()
        } 

    async function getStats() {
        // show progress bar
        pBar.show();
        const sources = [{ ...marker.getLngLat(), id: 1 }];
        console.log(sources)
        const statisticsResults = await client.statistics.dependent(sources, {
            maxEdgeWeight: Math.max(...stats.weights), travelType: "car", // 30 minutes on foot
            statisticsGroup: stats.group,
            statistics: stats.individual
        });

        const formatted = stats.individual.map((s) => {
            // map stats return to an array we can filter
            const curStat = Object.entries(statisticsResults.statistics[s.name].values).map(([key, val]) => {
                return {
                    weight: +key, stat: val
                }
            });

            // filter and sum the statistics
            const tallies = stats.weights.map(w => {
                const sum = curStat.filter(s => s.weight <= w).reduce((a, b) => {
                    return { stat: a.stat + b.stat }
                }, { stat: 0 });
                return Math.round(sum.stat)
            })

            return {
                label: s.label, backgroundColor: s.colors,
                borderWidth: 0, data: tallies
            }
        })

        // update chart
        chart.data.datasets = formatted;
        chart.update();

        // hide progress bar
        pBar.hide()
    }

    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { left: 8, right: 8, top: 20, bottom: 50 }
        },
        legend: { display: false },
        title: {
            display: true,
            text: "Population Accessed in 30 Minutes Car"
        }
    }

    const ctx = document.getElementById("canvas").getContext("2d");
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ['5min', '10min', '15min', '20min', '25min', '30min']
        },
        options: chartOptions
    });

    getStats();

  };
};

export { initStats };