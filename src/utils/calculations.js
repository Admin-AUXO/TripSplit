export const calculateBalances = (group) => {
  const balances = {};
  
  // Get all member IDs that are actually involved in bills
  const membersInBills = new Set();
  group.bills.forEach(bill => {
    // Add the person who paid
    if (bill.paidBy) membersInBills.add(bill.paidBy);
    // Add all members in the split ratio
    Object.keys(bill.splitRatio).forEach(memberId => {
      if (bill.splitRatio[memberId] > 0) {
        membersInBills.add(memberId);
      }
    });
  });
  
  // Initialize balances only for members involved in bills
  // This ensures new members added after bills are created don't affect calculations
  membersInBills.forEach(memberId => {
    balances[memberId] = 0;
  });
  
  // Also initialize for all current members (for display purposes)
  // But only calculate for those in bills
  group.members.forEach(member => {
    if (!balances.hasOwnProperty(member.id)) {
      balances[member.id] = 0; // New members not in any bills have 0 balance
    }
  });
  
  // Process each bill
  group.bills.forEach(bill => {
    const paidBy = bill.paidBy;
    const totalAmount = bill.amount;
    
    // Calculate each person's share
    const totalShares = Object.values(bill.splitRatio).reduce((sum, share) => sum + share, 0);
    
    if (totalShares > 0) {
      Object.entries(bill.splitRatio).forEach(([memberId, share]) => {
        if (share > 0 && balances.hasOwnProperty(memberId)) {
          const memberShare = (share / totalShares) * totalAmount;
          balances[memberId] -= memberShare; // They owe this amount
        }
      });
      
      // The person who paid gets credited (only if they exist)
      if (paidBy && balances.hasOwnProperty(paidBy)) {
        balances[paidBy] += totalAmount;
      }
    }
  });
  
  return balances;
};

// Optimized settlement calculation using greedy algorithm
// This minimizes the number of transactions needed (optimal for most cases)
export const calculateSettlements = (balances) => {
  const settlements = [];
  const creditors = [];
  const debtors = [];
  
  // Separate creditors and debtors with tolerance for floating point errors
  const TOLERANCE = 0.01;
  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance > TOLERANCE) {
      creditors.push({ memberId, amount: balance });
    } else if (balance < -TOLERANCE) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    }
  });
  
  // Sort by amount (largest first) - greedy approach minimizes transactions
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  // Greedy algorithm: match largest creditor with largest debtor
  // This creates at most (n-1) transactions where n is number of people
  // which is optimal (can't do better than n-1)
  let creditorIndex = 0;
  let debtorIndex = 0;
  
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > TOLERANCE) {
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: parseFloat(settlementAmount.toFixed(2))
      });
      
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;
      
      // Move to next creditor/debtor if fully settled
      if (creditor.amount < TOLERANCE) creditorIndex++;
      if (debtor.amount < TOLERANCE) debtorIndex++;
    } else {
      break;
    }
  }
  
  return settlements;
};

// Calculate expense statistics
export const calculateExpenseStats = (group) => {
  const stats = {
    total: 0,
    byCategory: {},
    byMember: {},
    averagePerPerson: 0,
    billCount: group.bills.length
  };
  
  group.bills.forEach(bill => {
    stats.total += bill.amount;
    
    // By category
    stats.byCategory[bill.category] = (stats.byCategory[bill.category] || 0) + bill.amount;
    
    // By member (who paid)
    stats.byMember[bill.paidBy] = (stats.byMember[bill.paidBy] || 0) + bill.amount;
  });
  
  if (group.members.length > 0) {
    stats.averagePerPerson = stats.total / group.members.length;
  }
  
  return stats;
};

