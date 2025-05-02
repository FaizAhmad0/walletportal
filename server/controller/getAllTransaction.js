const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const users = await User.find({}, "name paymentId email transactions"); // only fetch needed fields

    const allTransactions = [];

    users.forEach((user) => {
      user.transactions.forEach((transaction) => {
        allTransactions.push({
          userName: user.name,
          userEmail: user.email,
          amount: transaction.amount,
          credit: transaction.credit,
          debit: transaction.debit,
          description: transaction.description,
          paymentId: transaction.paymentId,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        });
      });
    });

    // console.log(allTransactions);

    res.status(200).json({ transactions: allTransactions });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ error: "Could not retrieve transactions" });
  }
};
