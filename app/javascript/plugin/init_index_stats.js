const initIndexStats = async () => {
  const coordinatesData = document.querySelectorAll(".location_row")
  coordinatesData.forEach((item) => {
    const markerData = JSON.parse(item.dataset.marker)
    const client = new tgm.TargomoClient('britishisles',  item.dataset.targomoApiKey);
    const lnglat = [{lng: markerData.lng, lat:markerData.lat, id:1}];
    const name = item.textContent;
    
    const stats = {
      group: 52,
      individual: [
      {
      id: 0, name: "Population", label: "Total population",
      colors: ["rgba(26,152,80,1)", "rgba(145,207,96,1)", "rgba(217,239,139,1)", "rgba(254,224,139,1)", "rgba(252,141,89,1)", "rgba(215,48,39,1)"]
      }
      ],
      weights: [300, 600, 900, 1200, 1500, 1800],
      colors: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'].reverse()
      } 
    
    async function getStats() {
    
      const statisticsResults = await client.statistics.dependent(lnglat, {
        maxEdgeWeight: 900, travelType: "car", // 30 minutes on foot
        statisticsGroup: stats.group,
        statistics: stats.individual
    });
    
    let tabCell = item.insertCell(-1);
    tabCell.innerHTML = statisticsResults.statistics.Population.total.toLocaleString()
  }

   getStats()
}); 
};

export { initIndexStats };