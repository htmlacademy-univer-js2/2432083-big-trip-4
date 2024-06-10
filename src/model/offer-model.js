import Observable from '../framework/observable';

export default class OfferModel extends Observable {
  #service = null;
  #offers = [];

  constructor(service) {
    super();
    this.#service = service;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      this.#offers = await this.#service.offers;
    } catch (err) {
      this.#offers = [];
    }
  }
}
