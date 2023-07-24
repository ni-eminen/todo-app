export const timestampIsOlderThan = (timestamp: number, olderThanLimit: number = 72000000) => {
    const today = new Date(Date.now());
  
    return today.getMilliseconds() - timestamp > olderThanLimit;
  };