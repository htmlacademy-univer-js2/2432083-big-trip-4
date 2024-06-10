import Observable from '../framework/observable';
import { FILTER_TYPES } from '../const';

export default class FilterModel extends Observable {
  #currentFilter = FILTER_TYPES.EVERYTHING;

  get filter() {
    return this.#currentFilter;
  }

  setFilter(newType, newFilter) {
    this.#currentFilter = newFilter;
    this._notify(newType, newFilter);
  }
}
