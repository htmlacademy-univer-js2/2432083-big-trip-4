import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { POINT_EMPTY, TIME_PERIODS } from '../const';

dayjs.extend(duration);

function getPointDuration(point) {
  const timeDiff = dayjs(point.dateTo).diff(dayjs(point.dateFrom));
  let pointDuration = 0;
  switch (true) {
    case (timeDiff >= TIME_PERIODS.MSEC_IN_DAY):
      pointDuration = dayjs.duration(timeDiff).format('DD[D] HH[H] mm[M]');
      break;
    case (timeDiff >= TIME_PERIODS.MSEC_IN_HOUR):
      pointDuration = dayjs.duration(timeDiff).format('HH[H] mm[M]');
      break;
    case (timeDiff < TIME_PERIODS.MSEC_IN_HOUR):
      pointDuration = dayjs.duration(timeDiff).format('mm[M]');
      break;
  }
  return pointDuration;
}

function getDefaultPoint() {
  return POINT_EMPTY;
}

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomInteger(a = 0, b = 1) {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function humanizeDate(format, date) {
  return dayjs(date).format(format);
}

function updateItems(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

function getCurrentDate() {
  return dayjs().format('YYYY/MM/DD');
}

export { getPointDuration, getRandomArrayElement, getRandomInteger, humanizeDate, updateItems, getDefaultPoint, getCurrentDate };
