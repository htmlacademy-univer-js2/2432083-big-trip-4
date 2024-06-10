function adaptPointToServer(point) {
  const adaptedPoint = {
    ...point,
    'base_price': point.basePrice,
    'date_from': new Date(point.dateFrom),
    'date_to': new Date(point.dateTo),
    'is_favorite': point.isFavorite,
  };

  delete adaptedPoint.basePrice;
  delete adaptedPoint.dateFrom;
  delete adaptedPoint.dateTo;
  delete adaptedPoint.isFavorite;
  return adaptedPoint;
}

function adaptPointToClient(point) {
  const adaptedPoint = {
    ...point,
    basePrice: point['base_price'],
    dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
    dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
    isFavorite: point['is_favorite'],
  };

  delete adaptedPoint['base_price'];
  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['is_favorite'];
  return adaptedPoint;
}

export { adaptPointToServer, adaptPointToClient };
