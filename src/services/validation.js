export function validateSubmission(data) {
  const must = ['propertyId','checkinDate','guestName','guestEmail',
                'activities','initials','signature','accepted'];

  for (const k of must) {
    if (data[k] === undefined || data[k] === '' ||
        (Array.isArray(data[k]) && !data[k].length)) {
      return `missing ${k}`;
    }
  }

  if (data.accepted !== true) {
    return 'master acceptance not ticked';
  }

  return null;
}
