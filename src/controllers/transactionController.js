import * as transactionService from "../services/transaction_service.js";

async function getBalance(req, res, next) {
  try {
    const balance = await transactionService.getBalance({
      userId: req.user.id,
    });
    res.json(balance);
  } catch (err) {
    next(err);
  }
}

async function topUp(req, res, next) {
  try {
    const { top_up_amount } = req.body;
    if (typeof top_up_amount !== "number" || top_up_amount <= 0) {
      return res.status(400).json({
        status: 102,
        message: "Parameter top_up_amount harus berupa angka positif",
        data: null,
      });
    }

    const data = await transactionService.topUp({
      userId: req.user.id,
      top_up_amount: parseInt(top_up_amount),
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function paymentService(req, res, next) {
  try {
    const result = await transactionService.payment({
      userId: req.user.id,
      service_code: req.body.service_code,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getTransactionHistory(req, res, next) {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 5;

    if (offset < 0) {
      return res.status(400).json({
        status: 102,
        message: "Parameter offset tidak boleh kurang dari 0",
        data: null,
      });
    }

    if (limit < 1) {
      return res.status(400).json({
        status: 102,
        message: "Parameter limit minimal 1",
        data: null,
      });
    }

    const result = await transactionService.getTransactionHistory(
      req.user.id,
      offset,
      limit
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export { getBalance, topUp, paymentService, getTransactionHistory };
