not finished, need test
To observe the map updates in real-time, enter matching names in the map settings section corresponding to your subscription topic.
 This lab project focuses on implementing MQTT protocol in a simple IoT Geoweb app
- This project uses javascript geolocation API to turn smartphones into an IoT sensor
- The webpage (https://zhiqiangjiang.github.io/engo651Lab5/) allows the user to connect, subscribe to a topic, publish a message to a topic, and share their location to a topic
- The webpage has text boxes, input textboxes, buttons, and a leaflet map

# Code Files
- index.html - webpage 
- script.js - logic for mqtt protocol, map, and page interactions

# TESTING INSTRUCTIONS
- Use host: test.mosquitto.org and port: 8081
- MQTTX settings - Host:mqtt://test.mosquitto.org, Port:1883
- Go to website https://zhiqiangjiang.github.io/engo651Lab5/
    - (iOS: Edge works, Safari has map issues, Chrome not tested)
    - (PC: Edge works, Chrome works)
- Subscribe to the topic course_name/your_name/my_temperature before clicking share status
- Enter the same name fields for the map settings to see the map get updated
