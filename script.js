var mqtt;
var reconnectTimeout = 4000;
var host = "test.mosquitto.org";
var port = 8081; //use port 8080 when testing locally (not on browser)
var connection_flag = 0;
var message = "";
var intentional_dc = 0;

// On connection lost
function onConnectionLost() {
    resetFields();
    if (intentional_dc == 0){
        console.log("Connection lost");
        document.getElementById("status").innerHTML = "Disconnected. Attempting to Reconnect.";
        document.getElementById("constatus").innerHTML = "Connection Lost. Attempting to Reconnect.";;
        setTimeout(MQTTconnect, reconnectTimeout);
    } else{
        console.log("Disconnected");
        document.getElementById("status").innerHTML = "Disconnected.";
        document.getElementById("constatus").innerHTML = "Connection Lost.";
    }
    connection_flag = 0;
    intentional_dc = 0;
}

// On connect 
function onConnect() {
    var tmpStr = "Connected to " + host + " on port " + port;
    document.getElementById("constatus").innerHTML = "Successfully Connected.";
    document.getElementById("status").innerHTML = tmpStr;
    console.log(tmpStr);
    connection_flag = 1;
}

// On failure to connect, automatically attempt to reconnect
function onFailure(){
    var tmpStr = "Connection Attempt to Host " + host + " on port " + port + " Failed. Attempting to Reconnect.";
    document.getElementById("constatus").innerHTML = tmpStr;
    console.log(tmpStr);
    setTimeout(MQTTconnect, reconnectTimeout);
}

// Logic to check if message is in JSON format
function isJson(msg) {
    console.log(msg);
    msg = typeof msg !== "string"
        ? JSON.stringify(msg)
        : msg;

    try {
        msg = JSON.parse(msg);
    } catch (e) {
        return false;
    }

    if (typeof msg === "object" && msg !== null) {
        return true;
    }

    return false;
}

// On message arrived
function onMessageArrived(msg){
    var tmpVar = msg.payloadString;
    if(isJson(tmpVar)){
        console.log("Received JSON: " + tmpVar);
        updateMap(tmpVar);
    } else {
        message = tmpVar;
        document.getElementById("messages").innerHTML = message;
        console.log("Received: " + message);
    }
}

// Connect function by pressing start
function MQTTconnect() {
    if(connection_flag == 1){
        var tmpStr = "Already Connected to " + host + "|" + port + ". Click end for new session.";
        document.getElementById("constatus").innerHTML = tmpStr;
        console.log(tmpStr);
        return;
    }
    document.getElementById("messages").innerHTML = "";
    var s = document.forms["con"]["sname"].value;
    var p = document.forms["con"]["pname"].value;

    if(s != "") {
        host = s;
        console.log("host = " + host);
    }

    if(p != "") {
        port = parseInt(p);
        console.log("port = " + port)
    }

    console.log("Connecting to " + host + " " + port);

    var x = Math.floor(Math.random() * 10000);
    var cname = "clientId-" + x;

    mqtt = new Paho.MQTT.Client(host, port, cname);
    var options = {
        useSSL: true, //remove this line when testing locally (not on browser)
        timeout: 4000,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived;
    mqtt.onConnectionLost = onConnectionLost;
    mqtt.connect(options);

}

// Close connection function by pressing end
function closeConnection(){
    if(connection_flag == 0){
        var tmpStr = "Not connected to any session.";
        document.getElementById("constatus").innerHTML = tmpStr;
        console.log(tmpStr);
        return;
    }
    resetFields();
    connection_flag = 0;
    intentional_dc = 1;
    mqtt.disconnect();
    var tmpStr = "Disconnected from " + host + " | " + port;
    document.getElementById("constatus").innerHTML = tmpStr;
    document.getElementById("status").innerHTML = "Not Connected";
    console.log(tmpStr);
}

// Subscribe to a topic
function subscribeTopic(){
    document.getElementById("substatus").innerHTML = "";
    if(connection_flag == 0){
        var tmpStr = "Not connected to any session.";
        document.getElementById("substatus").innerHTML = tmpStr;
        console.log(tmpStr);
        return;
    }

    var subtopic = document.forms["sub"]["tname"].value;
    mqtt.subscribe(subtopic);
    console.log("Subbed to topic: " + subtopic);
    document.getElementById("substatus").innerHTML = "Subbed to topic: " + subtopic;
}

// Send a message 
function sendMessage(){
    document.getElementById("msgstatus").innerHTML = "";
    if(connection_flag == 0){
        var tmpStr = "Not connected to any session.";
        document.getElementById("msgstatus").innerHTML = tmpStr;
        console.log(tmpStr);
        return;
    }

    var messageText = document.forms["msg"]["msgtext"].value;
    var topic = document.forms["msg"]["mtname"].value;

    message = new Paho.MQTT.Message(messageText);

    if (topic != "") {
        message.destinationName = topic;
    } else {
        message.destinationName = "default-topic";
    }
    mqtt.send(message);
    console.log("Message: " + messageText + " sent.")
    document.getElementById("msgstatus").innerHTML = "Message sent.";
}

// Reset all status fields
function resetFields() {
    document.getElementById("messages").innerHTML = "";
    document.getElementById("msgstatus").innerHTML = "";
    document.getElementById("substatus").innerHTML = "";
    document.getElementById("constatus").innerHTML = "";
    document.getElementById("mstatus").innerHTML = "";
}

// Create map
// var map = L.map('map').setView([51.049999, -114.066666], 10);

// var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
//     maxZoom: 18,
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
//         'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1
// }).addTo(map);
var map = L.map('map').setView([51.032077, -114.052983], 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
map.setZoom(50);

// Icons
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Update map with marker after receiving message
function updateMap(msg) {
    try {
        var tmpStr = JSON.stringify(msg);
        document.getElementById("messages").innerHTML = tmpStr;
        var tmpJSON = JSON.parse(msg);
        var la = tmpJSON.latitude;
        var lo = tmpJSON.longitude;
        var t = tmpJSON.temperature;
        document.getElementById("messages").innerHTML = "Received GeoJSON - Latitude: " + la + " | Longitude: " + lo + " | Temperature: " + t;

        if(t < 10) {
            //Blue
            var marker = L.marker([la, lo], {icon: blueIcon});
        } else if (t > 29) {
            //Red
            var marker = L.marker([la, lo], {icon: redIcon});
        } else {
            //Green
            var marker = L.marker([la, lo], {icon: greenIcon});
        }
        marker.bindPopup("Temperature: " + t + " degrees");
        marker.addTo(map);
    } catch (e) {
        console.log(e);
        document.getElementById("messages").innerHTML = "Invalid JSON file for app map.";
        console.log("Invalid JSON file for app map.");
    }
}

// Share status function
function shareStatus() {

    if(connection_flag == 0){
        var tmpStr = "Not connected to any session.";
        document.getElementById("mstatus").innerHTML = tmpStr;
        console.log(tmpStr);
        return;
    }

    const status = document.querySelector('#mstatus');
  
    function success(position) {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        status.textContent = '';
        var temperature = Math.floor((Math.random() * 101) - 40);

        var la = latitude.toString();
        var lo = longitude.toString();
        var t = temperature.toString();

        var geojson = '{"latitude": ' + la + ', "longitude": ' + lo + ', "temperature": ' + t + '}';

        document.getElementById("mstatus").innerHTML = "";
        if(connection_flag == 0){
            var tmpStr = "Not connected to any session.";
            document.getElementById("msgstatus").innerHTML = tmpStr;
            console.log(tmpStr);
            return;
        }

        var name = document.forms["stat"]["yrname"].value;
        if(name == ""){
            name = "zhiqiangjiang";
        }
        var course = document.forms["stat"]["crsname"].value;
        if(course == ""){
            course = "engo651";
        }
        var topic = course + "/" + name + "/my_temperature";
        var msgjson = new Paho.MQTT.Message(geojson);
        msgjson.destinationName = topic;

        mqtt.send(msgjson);
        console.log("Message: " + geojson + " sent to " + topic)
        document.getElementById("mstatus").innerHTML = "GeoJSON: " + geojson + " sent to " + topic;
    }
  
    function error() {
        status.textContent = 'Unable to retrieve your location';
    }
  
    if(!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser';
    } else {
        status.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }

}
  
