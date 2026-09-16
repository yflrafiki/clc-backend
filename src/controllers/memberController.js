const Member = require('../models/Member');
const generateMemberId = require('../utils/generateMemberId');

const getMembers = async (req, res) => {
  try {
    const members = await Member.findAll({ order: [['id', 'DESC']] });
    res.status(200).json(members);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

const createMember = async (req, res) => {
  try {
    const {
      full_name, email, gender, date_of_birth,
      phone_number, address, date_joined,
      emergency_contact, status
    } = req.body;

    const membership_id = await generateMemberId(date_joined);

    const member = await Member.create({
      membership_id,
      full_name,
      email,
      gender,
      date_of_birth,
      phone_number,
      address,
      date_joined,
      emergency_contact,
      status: status || 'Active'
    });

    res.status(201).json(member);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to create member' });
  }
};

module.exports = { getMembers, createMember };
