const pm25 =
document.getElementById("pm25");

const gas =
document.getElementById("gas");

const prediction =
document.getElementById("prediction");

const aqiValue =
document.getElementById("aqi-value");

const aqiStatus =
document.getElementById("aqi-status");

const weatherIcon =
document.getElementById("weather-icon");

const weatherText =
document.getElementById("weather-text");

const temp =
document.getElementById("temp");

const humidity =
document.getElementById("humidity");

const wind =
document.getElementById("wind");

const ctx =
document.getElementById("chart");

let labels = [];

let pmData = [];

let gasData = [];


/* ===========================
   CHART
=========================== */

const chart = new Chart(ctx, {

    type: "line",

    data: {

        labels: labels,

        datasets: [

            {
                label: "PM2.5",

                data: pmData,

                borderWidth: 3,

                tension: 0.4,

                borderColor:"#00d4ff",

                backgroundColor:"rgba(0,212,255,0.15)",

                fill:true
            },

            {
                label: "MQ135",

                data: gasData,

                borderWidth: 3,

                tension: 0.4,

                borderColor:"#9333ea",

                backgroundColor:"rgba(147,51,234,0.15)",

                fill:true
            }
        ]
    },

    options: {

        responsive:true
    }
});


/* ===========================
   MAP
=========================== */

const map =
L.map('map',{
    zoomControl:false
})
.setView([31.515355, 76.878331], 14);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
    attribution:'© OpenStreetMap'
}).addTo(map);


L.marker([31.515355, 76.878331])
.addTo(map)
.bindPopup("JNGEC Sundernagar")
.openPopup();


const circle = L.circle(
    [31.515355, 76.878331],
    {
        color:'#00d4ff',
        fillColor:'#00d4ff',
        fillOpacity:0.25,
        radius:700,
        weight:2
    }
).addTo(map);


const heat = L.heatLayer([

    [31.515355, 76.878331, 0.8],

    [31.516000, 76.879000, 0.5],

    [31.514000, 76.877000, 0.7],

    [31.517000, 76.880000, 0.6]

], {

    radius: 45,

    blur: 40,

    maxZoom: 17
})
.addTo(map);


/* ===========================
   AQI STATUS
=========================== */

function getStatus(value){

    if(value <= 50){

        return "Good";
    }

    else if(value <= 100){

        return "Moderate";
    }

    else{

        return "Unhealthy";
    }
}


/* ===========================
   WEATHER ICON
=========================== */

function updateWeather(aqi){

    if(aqi <= 50){

        weatherText.innerText = "Sunny";

        weatherIcon.src =
        "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    }

    else if(aqi <= 100){

        weatherText.innerText = "Cloudy";

        weatherIcon.src =
        "https://cdn-icons-png.flaticon.com/512/414/414825.png";
    }

    else{

        weatherText.innerText = "Polluted";

        weatherIcon.src =
        "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
    }
}


/* ===========================
   FETCH DATA
=========================== */

async function fetchData(){

    try{

        const response =
        await fetch("/data");

        const result =
        await response.json();

        const pm =
        result.current.pm25;

        const gs =
        result.current.gas;

        const pred =
        result.prediction;

        pm25.innerText = pm;

        gas.innerText = gs;

        prediction.innerText =
        Math.round(pred);

        const aqi =
        Math.max(pm, gs);

        aqiValue.innerText = aqi;

        aqiStatus.innerText =
        getStatus(aqi);

        updateWeather(aqi);

        temp.innerText =
        result.weather.temp + "°C";

        humidity.innerText =
        result.weather.humidity + "%";

        wind.innerText =
        result.weather.wind + " km/h";

        weatherText.innerText =
        result.weather.weather;

        heat.setLatLngs([

            [31.515355, 76.878331, aqi / 100],

            [31.516000, 76.879000, aqi / 120],

            [31.514000, 76.877000, aqi / 140],

            [31.517000, 76.880000, aqi / 110]

        ]);

        const time =
        new Date().toLocaleTimeString();

        labels.push(time);

        pmData.push(pm);

        gasData.push(gs);

        if(labels.length > 12){

            labels.shift();

            pmData.shift();

            gasData.shift();
        }

        chart.update();

    }

    catch(error){

        console.log(error);
    }
}

fetchData();

setInterval(fetchData,2000);