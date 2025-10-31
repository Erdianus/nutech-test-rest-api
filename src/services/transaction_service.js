import { query, withTransaction } from "../utils/sql.js";

/**
 * Generates a unique 15-character invoice code based on datetime
 * Format: YYMMDDHHMMSSXXX
 * YY: Year (2 digits)
 * MM: Month (2 digits)
 * DD: Day (2 digits)
 * HH: Hour (2 digits)
 * MM: Minute (2 digits)
 * SS: Second (2 digits)
 * XXX: Millisecond (3 digits)
 * Example: 251030152230100
 */
async function generateInvoiceCode() {
  const now = new Date();
  const code =
    "INV" +
    now.getFullYear().toString().slice(-2) + // YY
    String(now.getMonth() + 1).padStart(2, "0") + // MM
    String(now.getDate()).padStart(2, "0") + // DD
    String(now.getHours()).padStart(2, "0") + // HH
    String(now.getMinutes()).padStart(2, "0") + // MM
    String(now.getSeconds()).padStart(2, "0"); // SS

  return code;
}

async function getBalance({ userId }) {
  const data = await query("SELECT * FROM wallets WHERE user_id = ?", [userId]);
  return {
    status: 0,
    message: "Get Balance Berhasil",
    data: {
      balance: data[0].balance,
    },
  };
}

async function topUp({ userId, top_up_amount }) {
  // Ensure both values are numbers
  // const numericUserId = parseInt(userId);
  const numericAmount = parseInt(top_up_amount);

  const data = await query("SELECT * FROM wallets WHERE user_id = ?", [userId]);
  if (!data.length) {
    const error = new Error("Wallet tidak ditemukan");
    error.status = 102;
    error.httpStatus = 404;
    throw error;
  }

  const currentBalance = parseInt(data[0].balance);
  const newBalance = currentBalance + numericAmount;

  const result = await withTransaction(async (conn) => {
    await conn.execute("UPDATE wallets SET balance = ? WHERE user_id = ?", [
      newBalance,
      userId,
    ]);
    const invoiceCode = await generateInvoiceCode();
    await conn.execute(
      "INSERT INTO transactions(invoice_code, user_id, service_id, type, amount) VALUES (?, ?, NULL, ?, ?)",
      [invoiceCode, userId, "TOPUP", numericAmount]
    );
    return true;
  });
  return {
    status: 0,
    message: "Top Up Balance berhasil",
    data: {
      balance: newBalance,
    },
  };
}

async function payment({ userId, service_code }) {
  const dataWallet = await query("SELECT * FROM wallets WHERE user_id = ?", [
    userId,
  ]);
  const dataService = await query(
    "SELECT * FROM services WHERE service_code = ?",
    [service_code]
  );
  if (!dataService.length) {
    return {
      status: 102,
      message: "Service atau Layanan tidak ditemukan",
      data: null,
    };
  }
  const wallet = dataWallet[0];
  const service = dataService[0];
  const invoiceCode = await generateInvoiceCode();
  const newBalance = wallet.balance - service.cost;
  // console.log(invoiceCode);
  // console.log(userId);
  // console.log(service.service_id);

  if (wallet.balance >= service.cost) {
    // perform insert and update in a transaction, then fetch the inserted row
    const insertId = await withTransaction(async (conn) => {
      const [insertResult] = await conn.execute(
        "INSERT INTO transactions(invoice_code,user_id,service_id,type,amount) VALUES (?,?,?,?,?)",
        [invoiceCode, userId, service.id, "PAYMENT", service.cost]
      );
      await conn.execute("UPDATE wallets SET balance = ? WHERE user_id = ?", [
        newBalance,
        userId,
      ]);
      return insertResult.insertId;
    });

    // fetch the inserted transaction (with service info)
    const [txRows] = await query(
      `SELECT t.id, t.invoice_code, t.type, t.amount, t.created_at, s.service_code, s.name
       FROM transactions t
       LEFT JOIN services s ON t.service_id = s.id
       WHERE t.id = ? ORDER BY t.created_at DESC`,
      [insertId]
    );
    const tx = txRows;

    return {
      status: 0,
      message: "Transaksi berhasil",
      data: {
        invoice_number: invoiceCode,
        service_code: tx.service_code || service.service_code,
        service_name: tx.name || service.name,
        transaction_type: tx.type,
        total_amount: tx.amount,
        created_on: tx.created_at,
      },
    };
  } else {
    return {
      status: 102,
      message: "Saldo tidak cukup, silahkan lakukan top up terlebih dahulu",
      data: null,
    };
  }
}

async function getTransactionHistory(userId, offset = 0, limit = 5) {
  // Get total records for this user
  const [countResult] = await query(
    "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?",
    [userId]
  );
  const total = countResult.total;

  // Get paginated transactions
  const transactions = await query(
    `SELECT 
      t.invoice_code,
      t.type,
      t.amount,
      t.created_at,
      s.service_code,
      s.name
    FROM transactions t
    LEFT JOIN services s ON t.service_id = s.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  const records = transactions.map((tx) => ({
    invoice_number: tx.invoice_code,
    transaction_type: tx.type,
    total_amount: tx.amount,
    created_on: tx.created_at,
    service_code: tx.service_code || null,
    service_name: tx.name || null,
  }));

  return {
    status: 0,
    message: "Get History Berhasil",
    data: {
      offset,
      limit,
      records,
    },
  };
}

export { getBalance, topUp, payment, getTransactionHistory };
