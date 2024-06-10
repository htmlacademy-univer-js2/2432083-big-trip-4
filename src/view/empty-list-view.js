import AbstractView from '../framework/view/abstract-view';
import { FILTER_MESSAGES } from '../const';

function createEmptyListTemplate(currentFilterType) {
  return (
    `<p class="trip-events__msg">${FILTER_MESSAGES[currentFilterType]}</p>`
  );
}
export default class EmptyListView extends AbstractView {
  #currentFilterType = null;

  constructor(filterType) {
    super();
    this.#currentFilterType = filterType;
  }

  get template() {
    return createEmptyListTemplate(this.#currentFilterType);
  }
}
