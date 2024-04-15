import { render, replace } from '../framework/render.js';
import PointsView from '../view/trip-points-view.js';
import PreviewPointView from '../view/preview-point-view.js';
import EditingPointView from '../view/editing-point-view.js';
import SortingView from '../view/sorting-view.js';
import NoPointView from '../view/no-point-view.js';

export default class TripEventsPresenter {
  #pointsList = null;
  #tripContainer = null;
  #pointsModel = null;
  #boardPoints = null;
  #destinations = null;
  #offers = null;

  constructor(tripContainer) {
    this.#pointsList = new PointsView();
    this.#tripContainer = tripContainer;
  }

  init(pointsModel) {
    this.#pointsModel = pointsModel;
    this.#boardPoints = [...this.#pointsModel.points];
    this.#destinations = [...this.#pointsModel.destinations];
    this.#offers = [...this.#pointsModel.offers];

    if (this.#boardPoints.length === 0) {
      render(new NoPointView(), this.#tripContainer);
    }
    else {
      render(new SortingView(), this.#tripContainer);
      render(this.#pointsList, this.#tripContainer);
      for (const point of this.#boardPoints){
        this.#renderPoint(point);
      }
    }
  }

  #renderPoint = (point) => {
    const previewPointComponent = new PreviewPointView(point, this.#destinations, this.#offers);
    const editingPointComponent = new EditingPointView(point, this.#destinations, this.#offers);

    const replacePreviewPointToEditingPoint = () => {
      replace(editingPointComponent, previewPointComponent);
    };

    const replaceEditingPointToPreviewPoint = () => {
      replace(previewPointComponent, editingPointComponent);
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replaceEditingPointToPreviewPoint();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    previewPointComponent.setEditClickHandler(() => {
      replacePreviewPointToEditingPoint();
      document.addEventListener('keydown', onEscKeyDown);
    });

    editingPointComponent.setPreviewClickHandler(() => {
      replaceEditingPointToPreviewPoint();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    editingPointComponent.setFormSubmitHandler(() => {
      replaceEditingPointToPreviewPoint();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(previewPointComponent, this.#pointsList.element);
  };
}
