const Member = require('../models/Member');

const getMembers = async (req, res) => {

  try {

    const members = await Member.findAll({
      order: [['id', 'DESC']]
    });

    res.status(200).json(members);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to fetch members'
    });

  }
};

const createMember = async (req, res) => {

  try {

    const {
      full_name,
      gender,
      phone_number,
      address
    } = req.body;

    const membership_id =
      `MEM-${Date.now()}`;

    const member = await Member.create({
      membership_id,
      full_name,
      gender,
      phone_number,
      address
    });

    res.status(201).json(member);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to create member'
    });

  }
};

module.exports = {
  getMembers,
  createMember
};