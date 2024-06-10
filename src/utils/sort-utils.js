import dayjs from 'dayjs';

function sortByTime(points) {
  return points.sort((firstPoint, secondPoint) =>
    dayjs(firstPoint.dateFrom).diff(dayjs(firstPoint.dateTo), 'minutes') -
    dayjs(secondPoint.dateFrom).diff(dayjs(secondPoint.dateTo), 'minutes'));
}

function sortByPrice(points) {
  return points.sort((firstPoint, secondPoint) => secondPoint.basePrice - firstPoint.basePrice);
}

function sortByDay(points) {
  return points.sort((firstPoint, secondPoint) => new Date(firstPoint.dateFrom) - new Date(secondPoint.dateFrom));
}

export { sortByTime, sortByPrice, sortByDay };
