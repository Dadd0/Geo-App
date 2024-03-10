'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    _id = (Date.now() + '').slice(-10); // Id created using last 10 digits of the timestamp

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }

}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
};

class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
};


class App {
    // Private instance properties
    #map;
    #mapEvent;
    #workouts = [];

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

    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.classList.add("hidden");
    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle('form__row--hidden');
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e) {
        e.preventDefault();

        const validateInputs = function (allPositive, ...inputs) {
            const checkIsNumber = inputs.every(input => Number.isFinite(input));
            const checkIsPositive = inputs.every(input => input > 0);
            return allPositive ? checkIsNumber & checkIsPositive : checkIsNumber;
        };

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;

        let workout;

        if (type == "running") {
            const cadence = +inputCadence.value;
            if (!validateInputs(true, distance, duration, cadence)) {
                return alert("Input has to be a positive number");
            }
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        if (type == "cycling") {
            const elevation = +inputElevation.value;
            if (!validateInputs(false, distance, duration, elevation)) {
                return alert("Input has to be a positive number ");
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        this.#workouts.push(workout);

        // Render workout on the map
        this._renderWorkoutMarker(workout)

        // Render workout in the sidebar
        this._renderWorkout(workout);

        // Clear input fields and Hide form
        this._hideForm();
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        })
        ).setPopupContent(`${workout.type === "running" ? "🏃🏻‍♂️" : "🚴🏻‍♂️"} ${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === "running" ? "🏃🏻‍♂️" : "🚴🏻‍♂️"}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

        if (workout.type === "running") {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${(workout.pace).toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">👟</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        }

        if (workout.type === "cycling") {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${(workout.speed).toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
        }
        form.insertAdjacentHTML("afterend", html);
    }

}


const app = new App;
app._getPosition();

// First function called in case of success, other of fail

