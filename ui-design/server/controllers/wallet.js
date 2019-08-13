const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Users = require("../models").Users;
const Trips = require("../models").Trips;
const payments = require("../models").Payments;
const wallet = require("../models").Wallet;
const Currency = require("../models").Currency;
const moment = require("moment");
const sendMail = require("../mail/mail");
const TernsterAccounts = require("../models").TernsterAccounts;

module.exports = {
  async checkAccountNumberAlreadyExists(req, res, next) {
    try {
      const checkAccountNumberAlreadyExists = await TernsterAccounts.findOne({
        where: {
          account_no: req.params.account_no
        }
      });
      res.status(200).json({
        status: 200,
        message: "Check account details already exists.",
        response: {
          checkAccountNumberAlreadyExists: checkAccountNumberAlreadyExists
            ? true
            : false,
          id: checkAccountNumberAlreadyExists
            ? checkAccountNumberAlreadyExists.id
            : null
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async createBankAccountDetails(req, res, next) {
    try {
      const userId = req.session.user.id;
      const checkTheBackAccountDetails = await TernsterAccounts.findAll({
        where: {
          user_id: userId
        }
      });
      if (checkTheBackAccountDetails.length < 5) {
        const checkAccountNumberAlreadyExists = await TernsterAccounts.findOne({
          where: {
            account_no: req.body.account_no
          }
        });
        !checkAccountNumberAlreadyExists
          ? (await TernsterAccounts.create({ ...req.body, user_id: userId }),
            res.status(200).json({
              status: 200,
              message: "Account details created successfully",
              response: {}
            }))
          : res.status(404).json({
              status: 404,
              message: "Sorry account number already exists.",
              response: {}
            });
      } else {
        res.status(404).json({
          status: 404,
          message: "Sorry only 5 accounts can be created",
          response: {}
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async updateBankAccountDetails(req, res, next) {
    try {
      const checkAccountNumberAlreadyExists = await TernsterAccounts.findOne({
        where: {
          account_no: req.body.account_no,
          id: { [Op.ne]: req.body.id }
        }
      });
      !checkAccountNumberAlreadyExists
        ? (await TernsterAccounts.update(req.body, {
            where: { id: req.body.id }
          }),
          res.status(200).json({
            status: 200,
            message: "Account details updated successfully",
            response: {}
          }))
        : res.status(404).json({
            status: 404,
            message: "Sorry account number already exists.",
            response: {}
          });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async getBankAccountDetails(req, res, next) {
    try {
      const userId = req.session.user.id;
      const getBackAccountDetails = await TernsterAccounts.findAll({
        where: { user_id: userId }
      });
      res.status(200).json({
        status: 200,
        message: "Account details fetched successfully",
        response: getBackAccountDetails
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async deleteBankAccountDetails(req, res, next) {
    try {
      await TernsterAccounts.destroy({
        where: {
          id: req.params.id
        }
      });
      res.status(200).json({
        status: 200,
        message: "Account details deleted successfully",
        response: {}
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async getCurrencyList(req, res, next) {
    try {
      const getCurrencyList = await Currency.findAll({ where: { status: 1 } });
      res.status(200).json({
        status: 200,
        message: "currency list fetched successfully.",
        response: getCurrencyList
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async checkTheBaseCurrencyEnable(req, res, next) {
    try {
      const userId = req.session.user.id;
      let enable = false;
      const checkUserBalanceDetails = await wallet.findOne({
        where: {
          user_id: userId,
          status: 1
        }
      });
      if (checkUserBalanceDetails) {
        !checkUserBalanceDetails.pending_balance &&
        !checkUserBalanceDetails.available_balance
          ? (enable = true)
          : null;
        res.status(200).json({
          status: 200,
          message: "Base currency enable option",
          response: { enable }
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Base currency enable option",
          response: { enable }
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async setBaseCurrency(req, res, next) {
    try {
      const userId = req.session.user.id;
      const checkUserBalanceDetails = await wallet.findOne({
        where: {
          user_id: userId,
          status: 1
        }
      });
      if (checkUserBalanceDetails) {
        !checkUserBalanceDetails.pending_balance &&
        !checkUserBalanceDetails.available_balance
          ? await Users.update(
              {
                currency_id: req.body.base_currency
              },
              {
                where: { id: req.session.user.id }
              }
            )
          : res.status(404).json({
              status: 404,
              message:
                "Sorry please make the available and pending balance as 0.",
              response: {}
            });
        res.status(200).json({
          status: 200,
          message: "Base currency updated successfully.",
          response: {}
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "sorry wallet not created.",
          response: {}
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async getUserTransations(req, res, next) {
    try {
      const userId = req.session.user.id;
      const currency_id = req.query.currency_id;
      const payment_status = req.query.payment_status;
      const from_date =
        req.query.from_date != "null" && req.query.from_date
          ? moment(req.query.from_date)
              .subtract(1, "days")
              .format("YYYY-MM-DD HH:mm:ss")
          : null;
      const to_date =
        req.query.to_date != "null" && req.query.to_date
          ? moment(req.query.to_date)
              .add(1, "days")
              .format("YYYY-MM-DD HH:mm:ss")
          : null;
      const queryFormation = {
        [Op.or]: [{ trip_user_id: userId }, { requestor_id: userId }]
      };
      from_date ? (queryFormation.created_at = { [Op.gte]: from_date }) : null;
      to_date ? (queryFormation.created_at = { [Op.lte]: to_date }) : null;
      from_date && to_date
        ? (queryFormation.created_at = { [Op.between]: [from_date, to_date] })
        : null;
      payment_status != "null" && payment_status != "all" && payment_status
        ? (queryFormation[Op.and] = { status: payment_status })
        : null;
      currency_id != "null" && currency_id != "all" && currency_id
        ? (queryFormation[Op.and] = {
            [Op.or]: [
              { currency_id: currency_id },
              { converted_currency_id: currency_id }
            ]
          })
        : null;
      const getUserTransations = await payments.findAll({
        where: queryFormation,
        order: [["id", "DESC"]],
        include: [
          {
            model: Users,
            as: "trip_user_details",
            attributes: ["id", "name", "email"],
            include: [
              {
                model: Currency,
                as: "currency"
              }
            ]
          },
          {
            model: Users,
            as: "requester_details",
            attributes: ["id", "name", "email"],
            include: [
              {
                model: Currency,
                as: "currency"
              }
            ]
          },
          {
            model: Trips,
            as: "trip_details",
            attributes: [
              "id",
              "trip_name",
              "description",
              "departure",
              "destination"
            ]
          },
          {
            model: Currency,
            as: "currency"
          },
          {
            model: Currency,
            as: "converted_currency"
          }
        ]
      });
      if (getUserTransations.length > 0) {
        const transationsList = getUserTransations.map(transation => {
          if (transation.trip_user_id == userId) {
            if (transation.status == "success") {
              transation.dataValues["amount_type"] = "credited";
            } else if (transation.status == "withdraw") {
              transation.dataValues["amount_type"] = "debited";
            }
          } else {
            if (transation.status == "success") {
              transation.dataValues["amount_type"] = "debited";
            } else if (transation.status == "withdraw") {
              transation.dataValues["amount_type"] = "credited";
            }
          }
          return transation;
        });
        res.status(200).json({
          status: 200,
          message: "transations list successfully fetched.",
          response: transationsList
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "No trancsation data found",
          response: []
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async getUserWalletDetails(req, res, next) {
    try {
      const userId = req.session.user.id;
      const getUserWalletDetails = await wallet.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Users,
            as: "user_details",
            attributes: ["id", "name", "email"]
          }
        ]
      });
      getUserWalletDetails
        ? res.status(200).json({
            status: 200,
            message: "user wallet details successfully fetched.",
            response: getUserWalletDetails
          })
        : res.status(404).json({
            status: 404,
            message: "No wallet details found for the given user.",
            response: {}
          });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },

  async sendPayoutRequest(req, res, next) {
    try {
      const userId = req.session.user.id;
      const getUserBaseCurrency = await Users.findOne({
        where: {
          id: userId,
          status: 1
        },
        attributes: ["id", "name", "email"],
        include: [
          {
            model: Currency,
            as: "currency"
          }
        ]
      });
      const userWalletDetails = await wallet.findOne({
        where: { user_id: userId, status: 1 }
      });
      userWalletDetails.available_balance >=
      getUserBaseCurrency.currency.minimum_amount
        ? (sendMail(
            "../template/payoutrequest.hbs",
            "dhivakar.blaze@gmail.com",
            "Money request from ternster",
            {
              name: getUserBaseCurrency.name,
              email: getUserBaseCurrency.email,
              currency_symbol: getUserBaseCurrency.currency.symbol,
              amount: userWalletDetails.available_balance
            }
          ),
          res.status(200).json({
            status: 200,
            message: "Amount request send successfully.",
            response: {}
          }))
        : res.status(404).json({
            status: 404,
            message:
              "Sorry available balance less than the minimum amount to withdraw",
            response: error
          });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  }
};
