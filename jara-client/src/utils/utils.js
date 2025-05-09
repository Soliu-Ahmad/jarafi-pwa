export const groupTokensByDate = (transactions) => {
  return transactions.reduce((acc, transaction) => {
    const { date } = transaction;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});
};

export const formatDateToString = (inputDate) => {
  const [month, day, year] = inputDate.split('/').map(Number);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const suffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${monthNames[month - 1]} ${day}${suffix(day)}, ${year}`;
};


export const checkAxelarStatus = async (txHash, retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://api.axelarscan.io/gmp/${txHash}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Axelar responded with status ${response.status}`);
      }
    } catch (err) {
      console.warn(`Attempt ${i + 1}: Axelar status not ready yet.`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Failed to fetch Axelar transaction after retries.");
};
