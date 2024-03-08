'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {

    // Private instance properties
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField);
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
            alert("Can't get your position");
        })
    };

    _loadMap(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        const coords = [latitude, longitude];

        // Fix Uncaught Error
        if (this.#map) {
            this.#map.off();
            this.#map.remove();
        }
        
        this.#map = L.map('map').setView(coords, 16);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Click events handling
        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapevent) {
        this.#mapEvent = mapevent;
        form.classList.remove("hidden");
        inputDistance.focus();
    }
    
    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle('form__row--hidden');
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout() {
        e.preventDefault();
        
        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    
        // Display marker
        L.marker(this.#mapEvent.latlng).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "cycling-popup",
        })
        ).setPopupContent("Marker")
            .openPopup();
    }
}

const app = new App;
app._getPosition();

// First function called in case of success, other of fail

