import EditPointView from '../view/point-edit-view';
import { MODE, USER_ACTIONS, UPDATE_TYPES } from '../const';
import { RenderPosition, remove, render } from '../framework/render';

export default class NewPointPresenter {
  #mode = MODE.CREATING;
  #pointsListContainer = null;
  #allOffers = [];
  #allDestinations = [];
  #editPointComponent = null;
  #onDataChange = null;
  #onModeReset = null;
  #newEventBtn = null;

  constructor({ pointsListContainer, onDataChange, onModeReset, newEventBtn }) {
    this.#pointsListContainer = pointsListContainer;
    this.#onDataChange = onDataChange;
    this.#onModeReset = onModeReset;
    this.#newEventBtn = newEventBtn;
  }

  init(allOffers, allDestinations) {
    if (this.#editPointComponent) {
      return;
    }
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#editPointComponent = new EditPointView({
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onEditPointSave: this.#onEditPointSave,
      onEditPointDelete: this.#onEditPointCancel,
      mode: this.#mode,
    });
    render(this.#editPointComponent, this.#pointsListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#onEscapeKeydown);
  }

  destroy() {
    if (!this.#editPointComponent) {
      return;
    }
    this.#newEventBtn.disabled = false;
    this.#onModeReset();
    remove(this.#editPointComponent);
    this.#editPointComponent = null;
    document.removeEventListener('keydown', this.#onEscapeKeydown);
  }

  setAborting() {
    const resetFormState = () => {
      this.#editPointComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#editPointComponent.shake(resetFormState);
  }

  setSaving() {
    this.#editPointComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  #onEditPointCancel = () => {
    this.destroy();
  };

  #onEscapeKeydown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };

  #onEditPointSave = (updatedPoint) => {
    this.#onDataChange(
      USER_ACTIONS.ADD_TASK,
      UPDATE_TYPES.MAJOR,
      updatedPoint
    );
  };
}
