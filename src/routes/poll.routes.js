const { Router } = require('express');
const {
  addVote,
  getPollById,
  createPoll,
  getMyPolls,
  deletePoll,
} = require('../controllers/poll.controllers');
const { verifyJWT } = require('../middlewares/auth.middlewares');
const { validate } = require('../validators/validate');

const { createPollValidator } = require('../validators/poll.validators');

const router = Router();

router.route('/vote/:pollId').post(addVote);

router.use(verifyJWT);

// Secure routes for authenticated users only
router.route('/').post(createPollValidator(), validate, createPoll);
router.route('/:pollId').delete(deletePoll).get(getPollById);
router.route('/my/polls').get(getMyPolls);

module.exports = router;
