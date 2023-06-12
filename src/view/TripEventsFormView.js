import dayjs from 'dayjs';
import { FORM_MODE, FORM_STATUS } from '../const';
import { capitalize } from '../utils';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const BLANK_TASK = {
  id: '-1',
  'base_price': 100,
  'date_from': null,
  'date_to': null,
  destination: null,
  type: null,
  offers: [],
  'is_favourite': false,
};

const createTripEventsFormTemplate = (tripEventData, mode, offerModel, destinationModel) => {
  const dateFrom = dayjs(tripEventData['date_from']);
  const dateTo = dayjs(tripEventData['date_to']);
  const destination = destinationModel.getDestinationById(tripEventData.destination);
  const offersByType = offerModel.getOffersByType(tripEventData.type);

  const getTripTypeIconSrc = () => `img/icons/${tripEventData.type}.png`;
  const getDateTimeString = (date) => date.format('DD/MM/YY HH:mm');
  const getPrice = () => tripEventData['base_price'];

  const listTripEventTypes = () => offerModel.getTypes().map((tripEventType) => `
        <div class="event__type-item">
          <input id="event-type-${tripEventType}-1" class="event__type-input
            visually-hidden" type="radio" name="event-type" value="${tripEventType}"
          >
          <label class="event__type-label  event__type-label--${tripEventType}" for="event-type-${tripEventType}-1">
            ${capitalize(tripEventType)}
          </label>
        </div>
      `)
    .join('');

  const listDestinations = () => destinationModel.destinations.map((d) => `
        <option value="${d.name}"></option>
      `)
    .join('');

  const listOffers = () => {
    if (offersByType.length === 0) {
      return `
        <div class="event__offer-selector">
          No offers available
        </div>
      `;
    }
    const resultList = [];
    for (const offer of offersByType) {

      const isActive = tripEventData.offers.includes(offer.id);
      resultList.push(`
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-1"
            type="checkbox" name="event-offer-${offer.id}" ${isActive ? 'checked' : ''}
          >
          <label class="event__offer-label" for="event-offer-${offer.id}-1">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `);
    }
    return resultList.join('');
  };

  const offersSection = () => {
    if (offersByType.length === 0) {
      return '';
    }
    return `
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>

        <div class="event__available-offers">
          ${listOffers()}
        </div>
      </section>
    `;
  };

  const listDestinationPictures = () => destination.pictures.map((picture) => `
        <img class="event__photo" src="${picture.src}" alt="${picture.description}">
      `)
    .join('');

  const destinationSection = () => {
    if (destination.description && destination.pictures.length === 0) {
      return '';
    }
    return `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destination.description}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${listDestinationPictures()}
          </div>
        </div>
      </section>
    `;
  };

  const listControls = () => {
    if (mode === FORM_MODE.NEW) {
      return `
        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      `;
    } else { // if (mode === FormMode.EDIT)
      return `
        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
      `;
    }
  };

  return `
    <form class="event event--edit" action="#" method="post" autocomplete="off">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="${getTripTypeIconSrc()}" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${listTripEventTypes()}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${capitalize(tripEventData.type)}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${listDestinations()}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1"
            type="text" name="event-start-time" value="${getDateTimeString(dateFrom)}"
          >
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1"
            type="text" name="event-end-time" value="${getDateTimeString(dateTo)}"
          >
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1"
            type="text" name="event-price" value="${getPrice()}"
          >
        </div>

        ${listControls()}

      </header>
      <section class="event__details">
        ${offersSection()}
        ${destinationSection()}
      </section>
    </form>
  `;
};

export default class TripEventsFormView extends AbstractStatefulView {
  _state = BLANK_TASK;
  mode = FORM_MODE.NEW;
  status = FORM_STATUS.READY;

  #offerModel = null;
  #destinationModel = null;

  #datepickerFrom = null;
  #datepickerTo = null;

  #lastDestinationName = 'Chamonix';

  constructor(offerModel, destinationModel) {
    super();
    this.#offerModel = offerModel;
    this.#destinationModel = destinationModel;
  }

  get template() {
    return createTripEventsFormTemplate(this._state, this.mode, this.#offerModel, this.#destinationModel);
  }

  setMode(mode) {
    this.mode = mode;
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    if (this.status === FORM_STATUS.READY) {
      this._callback.formSubmit();
    }
  };

  setFormSubmitHandler = (callback) => {
    this._callback.formSubmit = callback;
    this.element.addEventListener('submit', this.#formSubmitHandler);
  };

  #cancelButtonHandler = (evt) => {
    evt.preventDefault();
    if (this.status === FORM_STATUS.READY) {
      this._callback.cancelButtonClick();
    }
  };

  setCancelButtonClickHandler = (callback) => {
    this._callback.cancelButtonClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelButtonHandler);
  };

  #arrowClickHandler = (evt) => {
    evt.preventDefault();
    if (this.status === FORM_STATUS.READY) {
      this._callback.arrowClick();
    }
  };

  setArrowClickHandler = (callback) => {
    this._callback.arrowClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#arrowClickHandler);
  };

  #setDateUpdateHandler = () => {
    if (this._state.date_from) {
      this.#datepickerFrom = flatpickr(
        this.element.querySelector('#event-start-time-1'),
        {
          dateFormat: 'd/m/y H:i',
          defaultDate: this._state.date_from,
          enableTime: true,
          'time_24hr': true,
          onClose: ([dateFrom], _, instance) => {
            let newDate = dateFrom.toISOString();
            if (newDate > this._state['date_to']) {
              alert('Дата начала не может быть позже даты окончания');
              newDate = this._state.date_from;
              instance.open();
            }
            this.updateElement({
              'date_from': newDate,
            });
          },
        },
      );
    }
    if (this._state['date_to']) {
      this.#datepickerTo = flatpickr(
        this.element.querySelector('#event-end-time-1'),
        {
          dateFormat: 'd/m/y H:i',
          defaultDate: this._state.date_to,
          enableTime: true,
          'time_24hr': true,
          onClose: ([dateTo], _, instance) => {
            let newDate = dateTo.toISOString();
            if (this._state['date_from'] > newDate) {
              alert('Дата окончания не может быть раньше даты начала');
              newDate = this._state['date_to'];
              instance.open();
            }
            this.updateElement({
              'date_to': newDate,
            });
          },
        },
      );
    }
  };

  _restoreHandlers() {
    this.#setDestinationTypeUpdateHandler();
    this.#setDestinationUpdateHandler();
    this.#setDateUpdateHandler();
    this.#setPriceUpdateHandler();
    this.#setOffersUpdateHandler();

    if (this._callback.formSubmit) {
      this.setFormSubmitHandler(this._callback.formSubmit);
    }
    if (this._callback.cancelButtonClick) {
      this.setCancelButtonClickHandler(this._callback.cancelButtonClick);
    }
    if (this._callback.arrowClick && this.mode === FORM_MODE.EDIT) {
      this.setArrowClickHandler(this._callback.arrowClick);
    }
  }

  createBlankForm(tripModel) {
    const _currentDate = dayjs().startOf('minute');
    const newState = {
      ...BLANK_TASK,
      id: tripModel.getNextId(),
      destination: this.#destinationModel.destinations[0].id,
      type: this.#offerModel.offers[0].type,
      'date_from': _currentDate.toISOString(),
      'date_to': _currentDate.add(1, 'days').toISOString(),
    };

    this.status = FORM_STATUS.READY;
    this._setState(newState);
    this.element;
    this._restoreHandlers();

  }

  updateElement(update) {
    super.updateElement(update);

    const destination = this.#destinationModel.getDestinationById(this._state.destination);
    this.#lastDestinationName = destination.name;
  }

  #setOffersUpdateHandler() {
    const checkboxes = this.element.querySelectorAll('.event__offer-checkbox');
    for (const checkbox of checkboxes) {
      checkbox.addEventListener('change', (evt) => {
        if (this.status !== FORM_STATUS.READY) {
          evt.preventDefault();
          return;
        }

        const checkboxId = evt.target.id; // it looks like 'event-offer-${offer.id}-1'
        const offerId = +checkboxId.split('-')[2];
        let newOffers;
        if (evt.target.checked) {
          newOffers = [...this._state.offers, offerId];
        } else {
          newOffers = this._state.offers.filter((id) => id !== offerId);
        }
        this.updateElement({
          offers: newOffers,
        });
      });
    }
  }

  #setPriceUpdateHandler() {
    const input = this.element.querySelector('#event-price-1');
    input.addEventListener('change', (evt) => {
      if (this.status !== FORM_STATUS.READY) {
        evt.preventDefault();
        return;
      }

      const newPrice = +evt.target.value;
      if (isNaN(newPrice)) {
        alert('Некорректная стоимость');
      } else if (newPrice <= 0) {
        alert('Стоимость должна быть больше нуля');
      } else {
        this.updateElement({
          'base_price': newPrice,
        });
      }
    });
  }

  #setDestinationTypeUpdateHandler() {
    const radios = this.element.querySelectorAll('input[name="event-type"]');
    for (const radio of radios) {
      radio.addEventListener('change', (evt) => {
        if (this.status !== FORM_STATUS.READY) {
          evt.preventDefault();
          return;
        }
        const value = evt.target.value;
        this.updateElement({
          type: value,
        });
      });
    }
  }

  #setDestinationUpdateHandler() {
    const input = this.element.querySelector('#event-destination-1');
    input.addEventListener('change', (evt) => {
      if (this.status !== FORM_STATUS.READY) {
        evt.preventDefault();
        return;
      }

      const value = evt.target.value.toLowerCase(); // case insensitive matching
      for (const destination of Object.values(this.#destinationModel.destinations)) {
        if (destination.name.toLowerCase() === value) {
          evt.target.value = destination.name;
          this.updateElement({
            destination: destination.id,
          });
          return;
        }
      }

      // incorrect destination.name here...
      alert(`Incorrect destination: ${evt.target.value}`);
      evt.preventDefault();
      evt.target.value = this.#lastDestinationName;
    });
  }

  makeSaving() {
    this.status = FORM_STATUS.SAVING;
    const saveButton = this.element.querySelector('.event__save-btn');
    saveButton.innerText = 'Saving...';
  }

  makeDeleting() {
    this.status = FORM_STATUS.DELETING;
    const deleteButton = this.element.querySelector('.event__reset-btn');
    deleteButton.innerText = 'Deleting...';
  }

  unlock() {
    if (this.status === FORM_STATUS.SAVING) {
      const saveButton = this.element.querySelector('.event__save-btn');
      saveButton.innerText = 'Save';
    } else if (this.status === FORM_STATUS.DELETING) {
      const deleteButton = this.element.querySelector('.event__reset-btn');
      deleteButton.innerText = 'Delete';
    }
    this.status = FORM_STATUS.READY;
  }
}
