module.exports = async (params) => {
  const { quickAddApi, variables } = params;

  function getPreviousWeekISOFormat() {
    const now = new Date();
    const previousWeek = new Date(now);
    previousWeek.setDate(now.getDate() - 7);

    return getISOWeekFormat(previousWeek);
  }

  function getISOWeekFormat(date) {
    const year = date.getFullYear();
    const weekNumber = getISOWeek(date);

    return `${year}-w${weekNumber.toString().padStart(2, "0")}`;
  }

  function getISOWeek(date) {
    // Create a copy of the date
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

    return weekNumber;
  }

  // Generate the previous week format
  const previousWeek = getPreviousWeekISOFormat();

  // Create the variables
  variables.previousWeek = previousWeek;

  // Show confirmation with example dates for verification
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - 7);
  new Notice(`Generated ISO week: ${previousWeek}`);

  return previousWeek;
};
