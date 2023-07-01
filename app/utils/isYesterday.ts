export const timestampIsYesterday = (timestamp: number) => {
    const today = new Date(Date.now());
    const timestampAsDate = new Date(timestamp);
  
    return today.getDate() - 1 == timestampAsDate.getDate();
  };