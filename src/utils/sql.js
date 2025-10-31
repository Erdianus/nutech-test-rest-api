import dbConfig from "../config/db.js";

async function query(sql, params = []) {
  const [rows] = await dbConfig.execute(sql, params);
  return rows;
}

async function withTransaction(work) {
  const conn = await dbConfig.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
}

export { query, withTransaction };
