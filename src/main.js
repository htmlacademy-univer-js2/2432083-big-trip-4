import TripPresenter from './presenter/trip-presenter.js';
import PointsApiService from './service/points-api-service.js';
import PointModel from './model/point-model.js';
import OfferModel from './model/offer-model.js';
import DestinationModel from './model/destination-model.js';

const siteMainElement = document.querySelector('.page-main');

const tripContainer = {
  mainElement: siteMainElement,
  tripMainElement: document.querySelector('.trip-main'),
  eventListElement: siteMainElement.querySelector('.trip-events'),
  filtersElement: document.querySelector('.trip-controls__filters'),
  newEvtButtonElement: document.querySelector('.trip-main__event-add-btn')
};

const pointsApiService = new PointsApiService('https://21.objects.htmlacademy.pro/big-trip', 'Basic privetgleb1');
const offerModel = new OfferModel(pointsApiService);
const destinationModel = new DestinationModel(pointsApiService);
const pointModel = new PointModel(pointsApiService, destinationModel, offerModel);

const tripPresenter = new TripPresenter({ tripContainer, pointModel, offerModel, destinationModel });
pointModel.init().finally(() => {
  tripContainer.newEvtButtonElement.style.visibility = 'visible';
});
tripPresenter.init();
