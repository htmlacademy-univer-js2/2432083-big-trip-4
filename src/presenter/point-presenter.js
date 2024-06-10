import PointView from '../view/point-view';
import EditPointView from '../view/point-edit-view';
import { remove, render, replace } from '../framework/render';
import { USER_ACTIONS, UPDATE_TYPES, MODE } from '../const';
import dayjs from 'dayjs';

export default class PointPresenter {
  #mode = MODE.DEFAULT;
  #allOffers = [];
  #allDestinations = [];
  #point = null;
  #oldPoint = null;
  #pointComponent = null;
  #editPointComponent = null;
  #pointsListContainer = null;
  #onDataChange = null;
  #onModeChange = null;

  constructor({ pointsListContainer, onDataChange, onModeChange }) {
    this.#pointsListContainer = pointsListContainer;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init(point, allOffers, allDestinations) {
    this.#point = point;
    this.#oldPoint = JSON.parse(JSON.stringify(point));
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    const previousPointComponent = this.#pointComponent;
    const previousEditPointComponent = this.#editPointComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onEditClick: this.#onEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editPointComponent = new EditPointView({
      point: this.#point,
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onEditPointReset: this.#onEditPointReset,
      onEditPointSave: this.#onEditPointSave,
      onEditPointDelete: this.#onEditPointDelete,
    });

    if (!previousPointComponent || !previousEditPointComponent) {
      render(this.#pointComponent, this.#pointsListContainer);
      return;
    }
    if (this.#mode === MODE.DEFAULT) {
      replace(this.#pointComponent, previousPointComponent);
    }
    if (this.#mode === MODE.EDITING) {
      replace(this.#editPointComponent, previousEditPointComponent);
    }
    remove(previousPointComponent);
    remove(previousEditPointComponent);
  }

  destroy = () => {
    remove(this.#pointComponent);
    remove(this.#editPointComponent);
  };

  resetView = () => {
    if (this.#mode !== MODE.DEFAULT) {
      this.#replaceFormToPoint();
    }
  };

  setSaving() {
    if (this.#mode === MODE.EDITING) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === MODE.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }
    const resetFormState = () => {
      this.#editPointComponent.updateElement({
        ...this.#oldPoint,
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#editPointComponent.shake(resetFormState);
  }

  setDeleting() {
    if (this.#mode === MODE.EDITING) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  #onEditClick = () => {
    this.#replacePointToForm();
  };

  #handleFavoriteClick = () => {
    this.#onDataChange(
      USER_ACTIONS.UPDATE_TASK,
      UPDATE_TYPES.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite }
    );
  };

  #replacePointToForm = () => {
    replace(this.#editPointComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#onEscapeKeydown);
    this.#onModeChange();
    this.#mode = MODE.EDITING;
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editPointComponent);
    document.removeEventListener('keydown', this.#onEscapeKeydown);
    this.#mode = MODE.DEFAULT;
  };

  #onEscapeKeydown = (evt) => {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #onEditPointSave = (updatedPoint) => {
    const isMinorUpdate = dayjs(updatedPoint.dateFrom).isSame(this.#point.dateFrom)
      || dayjs(updatedPoint.dateTo).isSame(this.#point.dateTo)
      || updatedPoint.price === this.#point.price;

    this.#onDataChange(
      USER_ACTIONS.UPDATE_TASK,
      isMinorUpdate ? UPDATE_TYPES.MINOR : UPDATE_TYPES.PATCH,
      updatedPoint,
    );
  };

  #onEditPointReset = () => {
    this.#editPointComponent.reset(this.#oldPoint);
    this.#replaceFormToPoint();
  };

  #onEditPointDelete = (updatedPoint) => {
    this.#onDataChange(
      USER_ACTIONS.DELETE_TASK,
      UPDATE_TYPES.MINOR,
      updatedPoint,
    );
  };
}
