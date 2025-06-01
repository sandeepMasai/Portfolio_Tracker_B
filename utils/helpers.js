const isValidDate = (dateString) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false;  
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; 
  return d.toISOString().slice(0, 10) === dateString;
};

module.exports = {
  isValidDate,
  // Add other utility functions here, e.g.,
  // calculateCAGR: (startValue, endValue, years) => { /* ... */ },
  // formatCurrency: (amount, currency = 'USD') => { /* ... */ },
};