const calculateSplits = (amount, currency, members, splitType, customSplits) => {
  const splits = [];

  if (splitType === 'equal') {
    const splitAmount = amount / members.length;
    members.forEach(memberId => {
      splits.push({
        user: memberId,
        amount: parseFloat(splitAmount.toFixed(2)),
        currency,
        settled: false
      });
    });

  } else if (splitType === 'percentage') {
    customSplits.forEach(split => {
      const splitAmount = (amount * split.percentage) / 100;
      splits.push({
        user: split.user,
        amount: parseFloat(splitAmount.toFixed(2)),
        currency,
        settled: false
      });
    });

  } else if (splitType === 'custom') {
    customSplits.forEach(split => {
      splits.push({
        user: split.user,
        amount: parseFloat(split.amount.toFixed(2)),
        currency,
        settled: false
      });
    });
  }

  return splits;
};

const calculateBalances = (expenses, userId) => {
  let totalOwed = 0;
  let totalOwing = 0;

  expenses.forEach(expense => {
    const isPayer = expense.paidBy._id.toString() === userId.toString();
    
    expense.splits.forEach(split => {
      const isOwer = split.user._id.toString() === userId.toString();
      
      if (isPayer && !isOwer) {
        totalOwed += split.amount;
      }
      if (!isPayer && isOwer && !split.settled) {
        totalOwing += split.amount;
      }
    });
  });

  return {
    totalOwed: parseFloat(totalOwed.toFixed(2)),
    totalOwing: parseFloat(totalOwing.toFixed(2)),
    netBalance: parseFloat((totalOwed - totalOwing).toFixed(2))
  };
};

module.exports = { calculateSplits, calculateBalances };