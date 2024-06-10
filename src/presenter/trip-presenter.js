import SortView from '../view/sort-view';
import PointListView from '../view/point-list-view';
import LoadingView from '../view/loading-view';
import EmptyListView from '../view/empty-list-view';
import TripInfoView from '../view/trip-info-view';
import PointPresenter from './point-presenter';
import FilterPresenter from './filter-presenter';
import NewPointPresenter from './new-point-presenter';
import FilterModel from '../model/filter-model';
import UiBlocker from '../framework/ui-blocker/ui-blocker';
import { sortByDay, sortByTime, sortByPrice } from '../utils/sort-utils';
import { FILTER } from '../utils/filter-utils';
import { render, RenderPosition, remove } from '../framework/render';
import { SORT_TYPES, MODE, USER_ACTIONS, UPDATE_TYPES, FILTER_TYPES, TIME_LIMITS } from '../const';

export default class TripPresenter {
  #tripContainer = null;
  #mode = MODE.DEFAULT;
  #currentSortType = SORT_TYPES.DAY;
  #isLoading = true;
  #newEvtButtonElement = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TIME_LIMITS.LOWER_LIMIT,
    upperLimit: TIME_LIMITS.UPPER_LIMIT
  });

  #tripInfoComponent = null;
  #emptyListComponent = null;
  #pointListComponent = null;
  #sortComponent = null;
  #loadingComponent = new LoadingView();

  #pointModel = null;
  #pointPresenters = new Map();
  #offerModel = null;
  #destinationModel = null;
  #filterModel = new FilterModel();
  #filterPresenter = null;
  #newPointPresenter = null;

  constructor({ tripContainer, pointModel, offerModel, destinationModel }) {
    this.#tripContainer = tripContainer;
    this.#pointListComponent = new PointListView();
    this.#pointModel = pointModel;
    this.#destinationModel = destinationModel;
    this.#offerModel = offerModel;
    this.#newEvtButtonElement = this.#tripContainer.newEvtButtonElement;
    this.#pointModel.addObserver(this.#onModelUpdate);
    this.#filterModel.addObserver(this.#onModelUpdate);
    this.#newEvtButtonElement.addEventListener('click', this.#onNewPointCreate);
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.#pointModel.points;
    const filteredPoints = FILTER[filterType](points);

    switch (this.#currentSortType) {
      case SORT_TYPES.DAY:
        return sortByDay([...filteredPoints]);
      case SORT_TYPES.TIME:
        return sortByTime([...filteredPoints]);
      case SORT_TYPES.PRICE:
        return sortByPrice([...filteredPoints]);
    }
    return filteredPoints;
  }

  get destinations() {
    return this.#destinationModel.destinations;
  }

  get offers() {
    return this.#offerModel.offers;
  }

  init() {
    this.#renderBoard();
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    this.#renderFilter();
    if (this.points.length === 0) {
      render(this.#pointListComponent, this.#tripContainer.eventListElement);
    }
    if (this.points.length === 0 && this.#mode !== MODE.CREATING) {
      this.#emptyListComponent = new EmptyListView(this.#filterModel.filter);
      render(this.#emptyListComponent, this.#tripContainer.eventListElement);
      return;
    }
    if (this.points.length !== 0) {
      this.#tripInfoComponent = new TripInfoView(this.points, this.destinations, this.offers);
      render(this.#tripInfoComponent, this.#tripContainer.tripMainElement, RenderPosition.AFTERBEGIN);
      this.#renderSort();
      render(this.#pointListComponent, this.#tripContainer.eventListElement);
      this.points.forEach((point) => this.#renderPoint(point));
    }
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    remove(this.#loadingComponent);
    remove(this.#emptyListComponent);
    remove(this.#tripInfoComponent);
    this.#filterPresenter.destroy();
    remove(this.#sortComponent);
    if (resetSortType) {
      this.#currentSortType = SORT_TYPES.DAY;
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointsListContainer: this.#pointListComponent.element,
      onDataChange: this.#onDataChange,
      onModeChange: this.#onModeChange,
      mode: this.#mode
    });
    pointPresenter.init(point, this.offers, this.destinations);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderNewPoint() {
    this.#mode = MODE.CREATING;
    this.#filterModel.setFilter(UPDATE_TYPES.MAJOR, FILTER_TYPES.EVERYTHING);
    this.#newPointPresenter = new NewPointPresenter({
      pointsListContainer: this.#pointListComponent.element,
      onDataChange: this.#onDataChange,
      onModeReset: this.#onModeReset,
      newEventBtn: this.#newEvtButtonElement,
      mode: this.#mode
    });
    this.#newPointPresenter.init(this.offers, this.destinations);
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      sortType: this.#currentSortType,
      onSortTypeChange: this.#onSortTypeChange,
    });
    render(this.#sortComponent, this.#tripContainer.eventListElement);
  }

  #renderFilter() {
    this.#filterPresenter = new FilterPresenter({
      filterContainer: this.#tripContainer.filtersElement,
      filterModel: this.#filterModel,
      pointsModel: this.#pointModel,
    });
    this.#filterPresenter.init();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#tripContainer.eventListElement, RenderPosition.AFTERBEGIN);
  }

  #onSortTypeChange = (newSortType) => {
    if (newSortType === this.#currentSortType) {
      return;
    }
    this.#currentSortType = newSortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #onNewPointCreate = (evt) => {
    evt.preventDefault();
    if (this.#mode !== MODE.CREATING) {
      this.#renderNewPoint();
      this.#newEvtButtonElement.disabled = true;
    }
  };

  #onDataChange = async (actionType, updateType, updatedPoint) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case USER_ACTIONS.UPDATE_TASK:
        this.#pointPresenters.get(updatedPoint.id).setSaving();
        try {
          await this.#pointModel.updatePoint(updateType, updatedPoint);
        } catch {
          this.#pointPresenters.get(updatedPoint.id).setAborting();
        } break;
      case USER_ACTIONS.ADD_TASK:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointModel.addPoint(updateType, updatedPoint);
          this.#newPointPresenter.destroy();
        } catch {
          this.#newPointPresenter.setAborting();
        } break;
      case USER_ACTIONS.DELETE_TASK:
        this.#pointPresenters.get(updatedPoint.id).setDeleting();
        try {
          await this.#pointModel.deletePoint(updateType, updatedPoint);
        } catch {
          this.#pointPresenters.get(updatedPoint.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #onModelUpdate = (updateType, data) => {
    switch (updateType) {
      case UPDATE_TYPES.PATCH:
        this.#pointPresenters.get(data.id).init(data, this.offers, this.destinations);
        break;
      case UPDATE_TYPES.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UPDATE_TYPES.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UPDATE_TYPES.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #onModeChange = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #onModeReset = () => {
    this.#mode = MODE.DEFAULT;
    if (this.points.length === 0) {
      this.#emptyListComponent = new EmptyListView(this.#filterModel.filter);
      render(this.#emptyListComponent, this.#tripContainer.eventListElement);
    }
  };
}
