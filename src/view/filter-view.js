import AbstractView from '../framework/view/abstract-view';
import { FILTER_TYPES } from '../const';
import { FILTER } from '../utils/filter-utils';

function createFilterTemplate(currentFilterType, points) {
  return (
    `<form class="trip-filters" action="#" method="get">
      ${Object.values(FILTER_TYPES).reduce((acc, filterType) => (`${acc}<div class="trip-filters__filter">
        <input id="filter-${filterType}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter"
        value="${filterType}" ${currentFilterType === filterType ? 'checked' : ''}
          ${FILTER[filterType](points).length === 0 ? 'disabled' : ''}>
        <label class="trip-filters__filter-label" for="filter-${filterType}">${filterType[0].toUpperCase() + filterType.slice(1)}</label>
      </div>`), '')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
}

export default class FilterView extends AbstractView {
  #currentFilterType = null;
  #handleFilterTypeChange = null;
  #allPoints = [];

  constructor({ allPoints, currentFilterType, onFilterTypeChange }) {
    super();
    this.#currentFilterType = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;
    this.#allPoints = allPoints;
    this.element.addEventListener('change', this.#onFilterTypeChange);
  }

  get template() {
    return createFilterTemplate(this.#currentFilterType, this.#allPoints);
  }

  #onFilterTypeChange = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
