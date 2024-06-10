import dayjs from 'dayjs';
import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import { getDefaultPoint, humanizeDate } from '../utils/point-utils';
import { POINT_TYPES, MODE } from '../const';

function createPointPhotosTemplate(pictures) {
  if (pictures !== null && pictures.length > 0) {
    const picturesStr = pictures.map(({ src }) => `<img class="event__photo" src="${src}" alt="Event photo">`);
    return (
      `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${picturesStr}
        </div>
      </div>`
    );
  }
  return '';
}

function createRouteTemplate(type, allDestinations, name, isDisabled) {
  const citiesList = allDestinations.map((destination) => destination.name);
  return (
    `<div class="event__field-group  event__field-group--destination">
      <label class="event__label  event__type-output" for="event-destination-1">
        ${type}
      </label>
      <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination"
       value="${he.encode(name ? name : '')}" list="destination-list-1" ${isDisabled ? 'disabled' : ''}>
      <datalist id="destination-list-1">
        ${Array.from(citiesList).reduce((acc, city) => (`${acc}<option value="${city}"></option>`), '')}
      </datalist>
    </div>`
  );
}

function createEventDetailsTemplate(description, pictures, offers, currOffers, isDisabled) {
  if (currOffers.length !== 0 || description && pictures) {
    let result = '<section class="event__details">';
    result += currOffers.length !== 0 ? createPointOffersTemplate(offers, currOffers, isDisabled) : '';
    result += description && pictures ? createDestinationTemplate(description, pictures) : '';
    return result;
  }
  return '';
}

function createDestinationTemplate(description, pictures) {
  return description && pictures ? (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination"> Destination</h3>
      <p class="event__destination-description">${description}</p>
        ${createPointPhotosTemplate(pictures)}
    </section>`
  ) : '';
}

function createPointTypesTemplate(currentType) {
  return POINT_TYPES.reduce((acc, type) =>
    acc.concat(`<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${currentType === type ? 'checked' : ''}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
    </div>`), '');
}

function createPointOffersTemplate(offers, currentOffers, isDisabled) {
  return (
    `<section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${currentOffers.reduce((acc, { id, title, price }) => (`${acc}<div class="event__offer-selector">
            <input class="event__offer-checkbox visually-hidden" id="event-offer-${title}-1" type="checkbox"
              name="event-offer-${title}" ${offers.includes(id) ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
            <label class="event__offer-label" for="event-offer-${title}-1">
              <span class="event__offer-title">${title}</span>
                &plus;&euro;&nbsp;
              <span class="event__offer-price">${price}</span>
            </label>
          </div>`), '')}
        </div>
      </section>`
  );
}

function createButtonsTemplate(mode, isDisabled, isSaving, isDeleting) {
  const rollupBtn =
    '<button class="event__rollup-btn" type="button">\
    <span class="visually-hidden">Open event</span>\
  </button>';

  let resetBtn = '';
  if (mode === MODE.EDITING) {
    if (isDeleting) {
      resetBtn = 'Deleting...';
    } else {
      resetBtn = 'Delete';
    }
  } else {
    resetBtn = 'Cancel';
  }

  return (
    `<button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
      ${isSaving ? 'Saving...' : 'Save'}
    </button>
    <button class="event__reset-btn" type="reset" ${isDisabled && mode === MODE.CREATING ? 'disabled' : ''}>
      ${resetBtn}
    </button>
    ${mode === MODE.EDITING ? rollupBtn : ''}`
  );
}

function createEditPointTemplate(point, allOffers, allDestinations, mode) {
  const { isDisabled, isSaving, isDeleting, type, basePrice, dateFrom, dateTo, destination, offers } = point;
  const currOffers = allOffers.find((obj) => obj.type === type).offers;
  const currDestination = allDestinations.find((destintn) => destintn.id === destination);
  const name = currDestination ? currDestination.name : null;
  const description = currDestination ? currDestination.description : null;
  const pictures = currDestination ? currDestination.pictures : null;

  return (
    `<li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
            <header class="event__header">
                <div class="event__type-wrapper">
                  <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>
                  <div class="event__type-list">
                    <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${createPointTypesTemplate(type)}
                    </fieldset>
                  </div>
                </div>
                ${createRouteTemplate(type, allDestinations, name, isDisabled)}
                <div class="event__field-group  event__field-group--time">
                <label class="visually-hidden" for="event-start-time-1">From</label>
                <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time"
                  value="${dateFrom ? humanizeDate('DD/MM/YY HH:mm', dateFrom) : ''} ${isDisabled ? 'disabled' : ''}">
                &mdash;
                <label class="visually-hidden" for="event-end-time-1">To</label>
                <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                 value="${dateTo ? humanizeDate('DD/MM/YY HH:mm', dateTo) : ''} ${isDisabled ? 'disabled' : ''}">
                </div>
                <div class="event__field-group  event__field-group--price">
                <label class="event__label" for="event-price-1">
                    <span class="visually-hidden">Price</span>
                    &euro;
                </label>
                <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price"
                 value=${basePrice ? he.encode(String(basePrice)) : ''} ${isDisabled ? 'disabled' : ''}>
                </div>
                ${createButtonsTemplate(mode, isDisabled, isSaving, isDeleting)}
            </header>
            ${createEventDetailsTemplate(description, pictures, offers, currOffers, isDisabled)}
        </form>`);
}

export default class EditPointView extends AbstractStatefulView {
  #oldState = null;
  #handleEditPointReset = null;
  #handleEditPointSave = null;
  #handleEditDeletePoint = null;
  #datepickerForStart = null;
  #datepickerForEnd = null;
  #allOffers = [];
  #allDestinations = [];
  #mode = null;

  constructor({ point = getDefaultPoint(), allOffers, allDestinations, onEditPointReset, onEditPointSave, onEditPointDelete, mode = MODE.EDITING }) {
    super();
    this._setState(this.#parsePointToState(point));
    this.#oldState = JSON.parse(JSON.stringify(point));
    this.#handleEditPointReset = onEditPointReset;
    this.#handleEditPointSave = onEditPointSave;
    this.#handleEditDeletePoint = onEditPointDelete;
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#mode = mode;
    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state, this.#allOffers, this.#allDestinations, this.#mode);
  }

  _restoreHandlers() {
    if (this.#mode === MODE.EDITING) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onEditPointReset);
    }
    this.element.querySelector('.event__type-group').addEventListener('change', this.#onEditPointTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#onEditPointInputChange);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#onEditPointPriceChange);
    if (this.#allOffers.find((obj) => obj.type === this._state.type).offers.length !== 0) {
      this.element.querySelector('.event__available-offers').addEventListener('change', this.#onEditPointCheck);
    }
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#onEditPointSave);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#onEditPointDelete);
    this.#setFlatpickr();
  }

  reset = (point) => this.updateElement(this.#parsePointToState(point));

  #parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  #parseStateToPoint(state) {
    const point = { ...state };
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }

  #setFlatpickr() {
    const commonConfig = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      'time_24hr': true,
      locale: {
        firstDayOfWeek: 1,
      }
    };
    this.#datepickerForStart = flatpickr(
      this.element.querySelectorAll('.event__input--time')[0],
      {
        ...commonConfig,
        onClose: this.#onEditPointDateFromChange,
      }
    );

    this.#datepickerForEnd = flatpickr(
      this.element.querySelectorAll('.event__input--time')[1],
      {
        ...commonConfig,
        onClose: this.#onEditPointDateToChange,
      }
    );
  }

  #onEditPointDateFromChange = ([fullStartDate]) => {
    const dateFrom = dayjs(fullStartDate).format('YYYY-MM-DDTHH:mm');
    this._setState({
      ...this._state,
      dateFrom,
      dateTo: this._state.dateTo
    });
  };

  #onEditPointDateToChange = ([fullEndDate]) => {
    const dateTo = dayjs(fullEndDate).format('YYYY-MM-DDTHH:mm');
    this._setState({
      ...this._state,
      dateFrom: this._state.dateFrom,
      dateTo
    });
  };

  #onEditPointTypeChange = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offers: []
    });
  };

  #onEditPointInputChange = (evt) => {
    evt.preventDefault();
    const name = evt.currentTarget.value;
    const destination = this.#allDestinations.find((obj) => obj.name === name);
    this.updateElement({
      destination: destination ? destination.id : null,
    });
  };

  #onEditPointPriceChange = (evt) => {
    evt.preventDefault();
    this.updateElement({
      basePrice: Number(evt.currentTarget.value)
    });
  };

  #onEditPointSave = (evt) => {
    evt.preventDefault();
    this.#handleEditPointSave(this.#parseStateToPoint(this._state));
  };

  #onEditPointDelete = (evt) => {
    evt.preventDefault();
    this.#handleEditDeletePoint(this.#parseStateToPoint(this._state));
  };

  #onEditPointReset = (evt) => {
    evt.preventDefault();
    this.#handleEditPointReset();
  };

  #onEditPointCheck = (evt) => {
    evt.preventDefault();
    let offers = this._state.offers;
    const offerTitle = evt.currentTarget.attributes[0].ownerDocument.activeElement.id;
    const splitIndex = offerTitle.indexOf('-', offerTitle.indexOf('-') + 1);
    const title = offerTitle.substr(splitIndex + 1).slice(0, -2);
    const id = this.#allOffers.find((obj) => obj.type === this._state.type).offers.find((obj) => obj.title === title).id;
    if (offers.includes(id)) {
      const index = offers.indexOf(id);
      offers = [
        ...offers.slice(0, index),
        ...offers.slice(index + 1)];
    } else {
      offers.push(id);
    }
    this._setState({
      ...this._state,
      offers,
    });
  };
}
