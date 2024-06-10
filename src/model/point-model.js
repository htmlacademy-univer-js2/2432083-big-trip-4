import Observable from '../framework/observable';
import { adaptPointToClient } from '../utils/server-utils';
import { UPDATE_TYPES } from '../const';

export default class PointModel extends Observable {
  #points = null;
  #service = null;
  #offerModel = null;
  #destinationModel = null;

  constructor(service, destinationModel, offerModel) {
    super();
    this.#service = service;
    this.#destinationModel = destinationModel;
    this.#offerModel = offerModel;
  }

  get points() {
    return this.#points;
  }

  async init() {
    try {
      const points = await this.#service.points;
      await Promise.all([
        this.#destinationModel.init(),
        this.#offerModel.init()
      ]);
      this.#points = points.map(adaptPointToClient);
    } catch (error) {
      this.#points = [];
    }
    this._notify(UPDATE_TYPES.INIT);
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#service.addPoint(update);
      const newPoint = adaptPointToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (error) {
      throw new Error('Can\'t add point');
    }
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#service.updatePoint(update);
      const updatedPoint = adaptPointToClient(response);
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1)
      ];
      window.console.log(this.#points);
      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Can\'t update point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      await this.#service.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1)
      ];
      this._notify(updateType);
    } catch (error) {
      throw new Error('Can\'t delete point');
    }
  }
}
