export const calculateBalances = (group) => {
  const balances = {};
  const membersInBills = new Set();
  
  group.bills.forEach(bill => {
    if (bill.paidBy) membersInBills.add(bill.paidBy);
    Object.entries(bill.splitRatio).forEach(([memberId, share]) => {
      if (share > 0) {
        membersInBills.add(memberId);
      }
    });
  });
  
  membersInBills.forEach(memberId => {
    balances[memberId] = 0;
  });
  
  group.members.forEach(member => {
    if (!(member.id in balances)) {
      balances[member.id] = 0;
    }
  });
  
  group.bills.forEach(bill => {
    const { paidBy, amount: totalAmount, splitRatio } = bill;
    const totalShares = Object.values(splitRatio).reduce((sum, share) => sum + share, 0);
    
    if (totalShares > 0 && totalAmount > 0) {
      Object.entries(splitRatio).forEach(([memberId, share]) => {
        if (share > 0 && memberId in balances) {
          const memberShare = (share / totalShares) * totalAmount;
          balances[memberId] -= memberShare;
        }
      });
      
      if (paidBy && paidBy in balances) {
        balances[paidBy] += totalAmount;
      }
    }
  });
  
  return balances;
};

export const calculateSettlements = (balances) => {
  const settlements = [];
  const creditors = [];
  const debtors = [];
  
  const TOLERANCE = 0.01;
  Object.entries(balances).forEach(([memberId, balance]) => {
    const roundedBalance = Math.round(balance * 100) / 100;
    
    if (roundedBalance > TOLERANCE) {
      creditors.push({ memberId, amount: roundedBalance });
    } else if (roundedBalance < -TOLERANCE) {
      debtors.push({ memberId, amount: Math.abs(roundedBalance) });
    }
  });
  
  if (creditors.length === 0 || debtors.length === 0) {
    return [];
  }
  
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  let creditorIndex = 0;
  let debtorIndex = 0;
  
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > TOLERANCE) {
      const roundedAmount = Math.round(settlementAmount * 100) / 100;
      
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: roundedAmount
      });
      
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;
      
      creditor.amount = Math.round(creditor.amount * 100) / 100;
      debtor.amount = Math.round(debtor.amount * 100) / 100;
      
      if (creditor.amount < TOLERANCE) creditorIndex++;
      if (debtor.amount < TOLERANCE) debtorIndex++;
    } else {
      break;
    }
  }
  
  return settlements;
};

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
    stats.byCategory[bill.category] = (stats.byCategory[bill.category] || 0) + bill.amount;
    stats.byMember[bill.paidBy] = (stats.byMember[bill.paidBy] || 0) + bill.amount;
  });
  
  if (group.members.length > 0) {
    stats.averagePerPerson = stats.total / group.members.length;
  }
  
  return stats;
};

