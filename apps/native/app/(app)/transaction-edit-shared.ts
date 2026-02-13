export type TransactionPayload = {
  id: string;
  title: string;
  amount: string;
  currency: string;
  type: "income" | "expense";
  category?: string | null;
  note?: string | null;
  occurredAt?: string | null;
};

export const parseTxParam = (data?: string) => {
  if (!data) return null;
  try {
    return JSON.parse(decodeURIComponent(String(data))) as TransactionPayload;
  } catch {
    return null;
  }
};

export const encodeTxParam = (tx: TransactionPayload) =>
  encodeURIComponent(JSON.stringify(tx));

const normalizeOptional = (value?: string | null) =>
  value && value.trim() ? value : null;

export const buildUpdatePayload = (tx: TransactionPayload) => ({
  title: tx.title,
  amount: Number(tx.amount),
  currency: tx.currency,
  type: tx.type,
  category: normalizeOptional(tx.category),
  note: normalizeOptional(tx.note),
  occurredAt: tx.occurredAt ? new Date(tx.occurredAt).toISOString() : null,
});

type TxUpdateListener = (tx: TransactionPayload) => void;
const txUpdateListeners = new Set<TxUpdateListener>();

export const subscribeTxUpdates = (listener: TxUpdateListener) => {
  txUpdateListeners.add(listener);
  return () => txUpdateListeners.delete(listener);
};

export const publishTxUpdate = (tx: TransactionPayload) => {
  txUpdateListeners.forEach((listener) => listener(tx));
};
