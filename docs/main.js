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

// Map initialization
var map = L.map('map').setView([0, 0], 2);
var fireLayer = L.layerGroup().addTo(map);

// FIRMS API URL (CSV)
const FIRMS_API_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/1746807051add9a45676c1b1a45d7301/VIIRS_SNPP_NRT/-141,41,-52,83/1/';

function csvToGeoJSON(csvData) {
    // Use PapaParse to convert CSV to JSON
    const parsedData = Papa.parse(csvData, { header: true, dynamicTyping: true });
    if (parsedData.errors.length > 0) {
        console.error("Error parsing CSV:", parsedData.errors);
        return { type: "FeatureCollection", features: [] }; // Return empty GeoJSON
    }

    const geojsonData = {
        type: "FeatureCollection",
        features: parsedData.data.map(row => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [row.longitude, row.latitude]
            },
            properties: {
                confidence: row.confidence,
                frp: row.frp,
                acq_date: row.acq_date,
                acq_time: row.acq_time,
                satellite: row.satellite,
                instrument: row.instrument
                // Add other properties as needed
            }
        }))
    };
    return geojsonData;
}

function updateFireData() {
    fetch(FIRMS_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text(); // Get the response as text (CSV)
        })
        .then(csvData => {
            const geojsonData = csvToGeoJSON(csvData); // Convert CSV to GeoJSON
            fireLayer.clearLayers();
            if (geojsonData && geojsonData.features) {
                geojsonData.features.forEach(feature => {
                    var coordinates = feature.geometry.coordinates;
                    var lat = coordinates[1];
                    var lng = coordinates[0];
                    var confidence = feature.properties.confidence;
                    var frp = feature.properties.frp;
                    var acq_date = feature.properties.acq_date;
                    var acq_time = feature.properties.acq_time;
                    var satellite = feature.properties.satellite;
                    var instrument = feature.properties.instrument;

                    var markerColor = 'red';
                    var radius = 5;

                    if (confidence === 'h') {
                        markerColor = 'red';
                        radius = 7;
                    } else if (confidence === 'm') {
                        markerColor = 'orange';
                        radius = 5;
                    } else {
                        markerColor = 'yellow';
                        radius = 3;
                    }

                    var fireMarker = L.circleMarker([lat, lng], {
                        radius: radius,
                        fillColor: markerColor,
                        color: '#333',
                        weight: 1,
                        opacity: 0.7
                    });

                    fireMarker.bindPopup(`<b>Confidence:</b> ${confidence}<br><b>FRP:</b> ${frp.toFixed(1)}<br><b>Acq. Date:</b> ${acq_date}<br><b>Acq. Time:</b> ${acq_time}<br><b>Satellite:</b> ${satellite}<br><b>Instrument:</b> ${instrument}`);
                    fireLayer.addLayer(fireMarker);
                });
                console.log('Fire data updated');
            } else {
                console.warn('No fire data received or invalid format');
            }
        })
        .catch(error => {
            console.error('Error fetching or processing fire data:', error);
        });
}

// Initial update and periodic updates
updateFireData();
setInterval(updateFireData, 300000);
