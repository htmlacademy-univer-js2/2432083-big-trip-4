import FilterView from '../view/filter-view';
import { UPDATE_TYPES } from '../const';
import { remove, render, replace } from '../framework/render';

export default class FilterPresenter {
  #filterModel = null;
  #pointsModel = null;
  #filterComponent = null;
  #filterContainer = null;

  constructor({ filterContainer, filterModel, pointsModel }) {
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#filterContainer = filterContainer;
    this.#filterModel.addObserver(this.#onModelUpdate);
    this.#pointsModel.addObserver(this.#onModelUpdate);
  }

  init() {
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      allPoints: this.#pointsModel.points,
      currentFilterType: this.#filterModel.currentFilter,
      onFilterTypeChange: this.#onFilterTypeChange,
    });

    if (!prevFilterComponent) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  destroy() {
    remove(this.#filterComponent);
  }

  #onFilterTypeChange = (newType) => {
    if (newType === this.#filterModel.currentFilter) {
      return;
    }

    this.#filterModel.setFilter(UPDATE_TYPES.MAJOR, newType);
  };

  #onModelUpdate = () => {
    this.init();
  };
}
