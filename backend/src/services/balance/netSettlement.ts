interface MemberBalance {
  userId: string;
  name: string;
  amount: number; // positive = owes money, negative = is owed money
}

interface SettlementTransaction {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amount: number;
}

export function calculateNetSettlement(balances: MemberBalance[]): SettlementTransaction[] {
  const creditors: { userId: string; name: string; amount: number }[] = [];
  const debtors: { userId: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.amount > 0.01) {
      debtors.push({ userId: b.userId, name: b.name, amount: b.amount });
    } else if (b.amount < -0.01) {
      creditors.push({ userId: b.userId, name: b.name, amount: Math.abs(b.amount) });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: SettlementTransaction[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);

    if (amount > 0.01) {
      transactions.push({
        from: { userId: debtors[i].userId, name: debtors[i].name },
        to: { userId: creditors[j].userId, name: creditors[j].name },
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
}
