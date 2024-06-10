import Observable from '../framework/observable';

export default class DestinationModel extends Observable {
  #service = null;
  #destinations = [];

  constructor(service) {
    super();
    this.#service = service;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      this.#destinations = await this.#service.destinations;
    } catch (err) {
      this.#destinations = [];
    }
  }
}
