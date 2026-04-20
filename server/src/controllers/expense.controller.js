const Expense = require('../models/Expense.model');
const Group = require('../models/Group.model');
const { calculateSplits } = require('../utils/splitCalculator');

const createExpense = async (req, res) => {
  try {
    const {
      groupId,
      description,
      amount,
      currency,
      splitType,
      customSplits
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const splits = calculateSplits(
      amount,
      currency || group.baseCurrency,
      group.members,
      splitType || 'equal',
      customSplits
    );

    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user._id,
      description,
      amount,
      currency: currency || group.baseCurrency,
      splitType: splitType || 'equal',
      splits
    });

    const populated = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpensesByGroup = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { description, amount, currency, splitType, customSplits } = req.body;

    const group = await Group.findById(expense.group);
    const splits = calculateSplits(
      amount || expense.amount,
      currency || expense.currency,
      group.members,
      splitType || expense.splitType,
      customSplits
    );

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.currency = currency || expense.currency;
    expense.splitType = splitType || expense.splitType;
    expense.splits = splits;

    await expense.save();

    const updated = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const settleExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' })
    }

    expense.splits = expense.splits.map(split => {
      if (split.user.toString() === req.user._id.toString()) {
        split.settled = true
      }
      return split
    })

    await expense.save()

    const updated = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')

    const { getIO } = require('../socket')
    try {
      const io = getIO()
      const payerId = updated.paidBy._id.toString()
      io.to(payerId).emit('notification', {
        text: `${req.user.name} settled their share of "${updated.description}"`,
        time: 'just now',
        read: false,
        id: Date.now()
      })
    } catch (socketErr) {
      console.log('Socket notification failed:', socketErr.message)
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
  settleExpense
};