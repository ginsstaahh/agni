const tabs = document.querySelectorAll('.tab-buttons div');
const contents = document.querySelectorAll('.tab-content');

tabsEvent();

function tabsEvent() {
    tabsClick(tabs, contents);
}

function tabsClick(tabs, contents) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tab.dataset.tab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// 1. Initialize the map
const map = L.map('map').setView([56.1304, -106.3468], 4);
// Coordinates are roughly Canada’s center, with zoom level 4

// 2. Add a base tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // Optionally add attribution info:
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Fetch wildfire data
fetch('YOUR_REAL_DATA_SOURCE.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        // 4. Create a GeoJSON layer and add it to the map
        //    This assumes your data is in GeoJSON format.
        L.geoJSON(data, {
            // 5. Customize how each feature (wildfire) is shown
            pointToLayer: (feature, latlng) => {
                // For wildfires, a red circle marker might be suitable
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillOpacity: 0.7,
                    stroke: true,
                    weight: 1
                });
            },
            style: feature => {
                // You can set color based on severity, confidence, etc.
                return {
                    color: 'red',  // Outline color
                    fillColor: 'red'
                };
            },
            onEachFeature: (feature, layer) => {
                // 6. Optionally bind popups with more info about the wildfire
                // This depends on how your data is structured
                const { properties } = feature;
                const popupContent = `
          <strong>Wildfire ID:</strong> ${properties.fire_id || 'N/A'}<br/>
          <strong>Date Detected:</strong> ${properties.date || 'N/A'}<br/>
          <strong>Confidence:</strong> ${properties.confidence || 'N/A'}<br/>
          <strong>Latitude:</strong> ${feature.geometry.coordinates[1]}<br/>
          <strong>Longitude:</strong> ${feature.geometry.coordinates[0]}
        `;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error fetching wildfire data:', error);
    });
