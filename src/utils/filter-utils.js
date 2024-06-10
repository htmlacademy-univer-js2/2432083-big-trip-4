import dayjs from 'dayjs';
import { FILTER_TYPES } from '../const';
import { getCurrentDate } from '../utils/point-utils';

const FILTER = {
  [FILTER_TYPES.EVERYTHING]: (points) => points,
  [FILTER_TYPES.FUTURE]: (points) => points.filter((point) => isFuture(point)),
  [FILTER_TYPES.PRESENT]: (points) => points.filter((point) => isPresent(point)),
  [FILTER_TYPES.PAST]: (points) => points.filter((point) => isPast(point)),
};

function isPresent(point) {
  const dateFrom = dayjs(point.dateFrom).format('YYYY/MM/DD');
  const dateTo = dayjs(point.dateTo).format('YYYY/MM/DD');
  return (dayjs(dateFrom).isBefore(getCurrentDate()) || dayjs(dateFrom).isSame(getCurrentDate()))
    && (dayjs(dateTo).isAfter(getCurrentDate()) || dayjs(dateTo).isSame(getCurrentDate()));
}

function isPast(point) {
  const pointDate = dayjs(point.dateTo).format('YYYY/MM/DD');
  return dayjs(pointDate).isBefore(getCurrentDate());
}

function isFuture(point) {
  const pointDate = dayjs(point.dateFrom).format('YYYY/MM/DD');
  return dayjs(pointDate).isAfter(getCurrentDate());
}

export { FILTER };
