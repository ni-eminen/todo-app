export const timestampIsOlderThan = (timestamp: number, olderThanLimit: number = 72000000) => {
    const today = new Date(Date.now());
    const timestampAsDate = new Date(timestamp);
  
    return today.getMilliseconds() - timestamp > olderThanLimit;
  };