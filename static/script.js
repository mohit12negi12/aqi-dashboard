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

const ctx =
document.getElementById("chart");


let labels = [];

let pmData = [];

let gasData = [];


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

        responsive:true,

        plugins:{

            legend:{

                labels:{
                    color:"white"
                }
            }
        },

        scales:{

            x:{

                ticks:{
                    color:"#94a3b8"
                },

                grid:{
                    color:"rgba(255,255,255,0.05)"
                }
            },

            y:{

                ticks:{
                    color:"#94a3b8"
                },

                grid:{
                    color:"rgba(255,255,255,0.05)"
                }
            }
        }
    }
});



/* ===========================
   LIVE MAP
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



// Main Marker

const marker =
L.marker([31.515355, 76.878331])
.addTo(map);

marker.bindPopup(`
    <b>JNGEC Sundernagar</b>
    <br>
    Live AQI Monitoring Station
`).openPopup();



// AQI Highlight Area

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



// Outer Glow

const glowCircle = L.circle(
    [31.515355, 76.878331],
    {
        color:'#00ffff',

        fillColor:'#00ffff',

        fillOpacity:0.08,

        radius:1200,

        weight:1
    }
).addTo(map);



// Custom Popup

circle.bindPopup(`
    <div style="
        color:white;
        background:black;
        padding:10px;
        border-radius:10px;
        font-family:Inter;
    ">

    <h3 style="
        margin:0;
        color:#00d4ff;
    ">
        JNGEC AQI Zone
    </h3>

    <p style="
        margin-top:8px;
    ">
        Real-time environmental monitoring area
    </p>

    </div>
`);



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
   FETCH SENSOR DATA
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


        // Dynamic AQI Highlight

        if(aqi <= 50){

            circle.setStyle({

                color:"#22c55e",

                fillColor:"#22c55e"
            });

        }

        else if(aqi <= 100){

            circle.setStyle({

                color:"#eab308",

                fillColor:"#eab308"
            });

        }

        else{

            circle.setStyle({

                color:"#ef4444",

                fillColor:"#ef4444"
            });
        }


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