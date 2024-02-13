var map = L.map('mapid').setView([22.7918759, 91.1014740], 25); // Default view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Test'
}).addTo(map);

// Define custom icons for each bus type
var redBusIcon = L.icon({
    iconUrl: 'assets/red_bus_icon.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38], // Adjust based on actual icon size
    popupAnchor: [0, -38]
});

var blueBusIcon = L.icon({
    iconUrl: 'assets/blue_bus_icon.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38], // Adjust based on actual icon size
    popupAnchor: [0, -38]
});

// Function to select the correct icon based on bus type
function getBusIcon(type) {
    if (type === "Single-Deck") {
        return blueBusIcon;
    } else if (type === "Double-Decker") {
        return redBusIcon;
    } else {
        // Default icon if another type is encountered
        return L.icon({ /* ... */ });
    }
}


// Placeholder for bus markers with custom icons and popups
var buses = [
    {
        name: "Surjomukhi",
        type: "Double-Decker",
        latitude: 22.792387494069953,
        longitude: 91.10190756673111,
        departure: "1:00 PM"
    },
    {
        name: "Tigerlily",
        type: "Double-Decker",
        latitude: 22.79214676822004,
        longitude: 91.09911363748392,
        departure: "1:05 PM"
    },
    // Adding more buses
    {
        name: "Tiulip",
        type: "Single-Deck",
        latitude: 22.791948169087444,
        longitude: 91.10300098529498,
        departure: "1:00 PM"
    }
    // ... Add as many buses as you want
];


// Add bus markers to the map with click events for showing details
buses.forEach(bus => {
    var busIcon = getBusIcon(bus.type);
    var busMarker = L.marker([bus.latitude, bus.longitude], {icon: busIcon}).addTo(map)
        //.bindPopup(`${bus.name} (Double-decker)<br>Type: ${bus.type}`);

    busMarker.on('click', function(e) {
        // Update bus details on click
        document.getElementById('busDetails').innerHTML = `Name: ${bus.name}<br>Type: ${bus.type}<br>Left Campus: ${bus.departure}`;
    });
});




// Function to update the vehicle location
function updateVehicleLocation() {
    fetch('/api/vehicle-location') // Your API endpoint
        .then(response => response.json())
        .then(data => {
            var latLng = [data.latitude, data.longitude];
            L.marker(latLng, {icon: busIcon}).addTo(map) // Adjust this to your needs
                .bindPopup('Your Vehicle is here').openPopup();

            map.setView(latLng, 25); // Adjust map center and zoom
        })
        .catch(error => console.error('Error fetching location:', error));
}

// Update location every 5 seconds
setInterval(updateVehicleLocation, 5000);
updateVehicleLocation(); // Initial location update

// Function to update the bus timetable and include a countdown timer
function updateBusTimetable() {
    var now = new Date();
    var nextBusTime;
    var countdownElement = document.getElementById('nextBus');
    var busSchedule = ['12:00 PM', '1:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:30 PM']; // Example bus times
    var nextBusFound = false;

    for (var i = 0; i < busSchedule.length; i++) {
        var busTime = busSchedule[i];
        var busDate = new Date(now.toDateString() + ' ' + busTime);

        if (busDate > now) {
            nextBusTime = busDate;
            nextBusFound = true;
            break;
        }
    }

    if (!nextBusFound) {
        countdownElement.innerHTML = 'No more buses today.';
        return;
    }

    function updateCountdown() {
        var now = new Date();
        var difference = nextBusTime - now;

        if (difference <= 0) {
            countdownElement.innerHTML = 'Bus is leaving...';
            clearInterval(countdownInterval);
            setTimeout(updateBusTimetable, 1000); // Check for next bus
            return;
        }

        var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((difference % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Next bus at: ${busSchedule[i]}  Remaining: ${hours}h ${minutes}m ${seconds}s`;
    }

    var countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to start the countdown
}


// Function to open the modal with bus details
function openModal(busDetails) {
    document.getElementById('busDetailText').innerHTML = busDetails;
    document.getElementById('busModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('busModal').style.display = 'none';
}

// Function to search for a bus and display details
function searchBus() {
    var searchQuery = document.getElementById('busSearch').value.toLowerCase();
    var busDetails = 'Bus not found. Please try another search.';

    // Example search logic, replace with actual search logic
    buses.forEach(bus => {
        if (bus.name.toLowerCase() === searchQuery) {
            busDetails = `Name: ${bus.name}<br>Type: ${bus.type}<br>Departure: ${bus.departure}`;
        }
    });

    openModal(busDetails);
}




updateBusTimetable(); // Initial call to set up the timetable
setInterval(updateBusTimetable, 60000); // Update timetable every minute to catch the next schedule
