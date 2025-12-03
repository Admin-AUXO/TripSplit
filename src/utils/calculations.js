export const calculateBalances = (group) => {
  const balances = {};
  
  // Optimized: Only process members who are actually in bills
  // This ensures new members added after bills are created don't affect calculations
  const membersInBills = new Set();
  
  // First pass: collect all members involved in any bill
  group.bills.forEach(bill => {
    if (bill.paidBy) membersInBills.add(bill.paidBy);
    // Only iterate through non-zero split ratios for efficiency
    Object.entries(bill.splitRatio).forEach(([memberId, share]) => {
      if (share > 0) {
        membersInBills.add(memberId);
      }
    });
  });
  
  // Initialize balances for members in bills
  membersInBills.forEach(memberId => {
    balances[memberId] = 0;
  });
  
  // Initialize for all current members (for display - new members show 0)
  group.members.forEach(member => {
    if (!(member.id in balances)) {
      balances[member.id] = 0;
    }
  });
  
  // Second pass: calculate balances efficiently
  group.bills.forEach(bill => {
    const { paidBy, amount: totalAmount, splitRatio } = bill;
    
    // Calculate total shares (only non-zero shares matter)
    const totalShares = Object.values(splitRatio).reduce((sum, share) => sum + share, 0);
    
    if (totalShares > 0 && totalAmount > 0) {
      // Process each member's share
      Object.entries(splitRatio).forEach(([memberId, share]) => {
        if (share > 0 && memberId in balances) {
          const memberShare = (share / totalShares) * totalAmount;
          balances[memberId] -= memberShare; // They owe this amount
        }
      });
      
      // Credit the person who paid
      if (paidBy && paidBy in balances) {
        balances[paidBy] += totalAmount;
      }
    }
  });
  
  return balances;
};

// Optimized settlement calculation using greedy algorithm
// This minimizes the number of transactions needed (optimal for most cases)
// Algorithm: Greedy matching of largest creditor with largest debtor
// Time Complexity: O(n log n) where n is number of people
// Result: At most (n-1) transactions, which is optimal
export const calculateSettlements = (balances) => {
  const settlements = [];
  const creditors = [];
  const debtors = [];
  
  // Separate creditors and debtors with tolerance for floating point errors
  const TOLERANCE = 0.01;
  Object.entries(balances).forEach(([memberId, balance]) => {
    // Round to 2 decimal places to avoid floating point precision issues
    const roundedBalance = Math.round(balance * 100) / 100;
    
    if (roundedBalance > TOLERANCE) {
      creditors.push({ memberId, amount: roundedBalance });
    } else if (roundedBalance < -TOLERANCE) {
      debtors.push({ memberId, amount: Math.abs(roundedBalance) });
    }
  });
  
  // Early return if no settlements needed
  if (creditors.length === 0 || debtors.length === 0) {
    return [];
  }
  
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
      // Round to 2 decimal places for precision
      const roundedAmount = Math.round(settlementAmount * 100) / 100;
      
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: roundedAmount
      });
      
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;
      
      // Round to avoid floating point errors
      creditor.amount = Math.round(creditor.amount * 100) / 100;
      debtor.amount = Math.round(debtor.amount * 100) / 100;
      
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

