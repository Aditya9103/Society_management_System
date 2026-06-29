import * as pollRepo from './poll.repository.js';
import * as residentRepo from '../resident/resident.repository.js';

import { deleteFile, extractPublicId } from '../../services/storage.service.js';
import logger from '../../utils/logger.js';
import ApiError from '../../utils/ApiError.js';
import { sendNotification } from '../../services/notification.service.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import User from '../auth/user.model.js';

export const createPoll = async (societyId, adminId, payload) => {
    return pollRepo.createPoll({
        ...payload,
        societyId,
        createdBy: adminId,
        status: 'DRAFT',
    });
};

export const getAdminPolls = async (societyId) => {
    return pollRepo.getPollsBySociety(societyId);
};

export const getAdminPollById = async (societyId, pollId) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) throw ApiError.notFound('Poll not found');
    return poll;
};

export const publishPoll = async (societyId, pollId) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) throw ApiError.notFound('Poll not found');
    if (poll.status !== 'DRAFT') throw ApiError.badRequest('Only DRAFT polls can be published');

    poll.status = 'ACTIVE';
    await poll.save();

    // Fetch users who are residents
    const residents = await residentRepo.findResidentsBySocietyId(societyId);
    const userIds = residents.map(r => r.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('_id fcmTokens');

    if (users.length > 0) {
        sendNotification({
            users,
            societyId,
            title: 'New Poll Published',
            message: `Please vote: ${poll.title}`,
            type: 'POLL_STARTED',
            referenceType: 'POLL',
            referenceId: poll._id
        }).catch(e => console.error(e));
    }

    const io = getIO();
    if (io) {
        io.to(ROOMS.SOCIETY(societyId)).emit('POLL_CREATED', { pollId: poll._id, title: poll.title });
    }

    return poll;
};

export const closePoll = async (societyId, pollId) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) throw ApiError.notFound('Poll not found');
    if (poll.status !== 'ACTIVE') throw ApiError.badRequest('Only ACTIVE polls can be closed');

    poll.status = 'CLOSED';
    await poll.save();

    const io = getIO();
    if (io) {
        io.to(ROOMS.SOCIETY(societyId)).emit('POLL_CLOSED', { pollId: poll._id });
    }

    return poll;
};

export const deletePoll = async (societyId, pollId) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) {
        throw new Error('Poll not found');
    }

    // Delete associated images from Cloudinary
    if (poll.options && poll.options.length > 0) {
        for (const option of poll.options) {
            if (option.photoUrl) {
                const publicId = extractPublicId(option.photoUrl);
                if (publicId) {
                    try {
                        await deleteFile(publicId);
                    } catch (error) {
                        logger.error(`Failed to delete poll option image ${publicId}: ${error.message}`);
                    }
                }
            }
        }
    }

    return pollRepo.deletePoll(pollId, societyId);
};

export const getResidentActivePolls = async (societyId, userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) return [];

    const user = await User.findById(userId);
    const polls = await pollRepo.getPollsBySociety(societyId);
    const now = new Date();
    
    const activePolls = polls.filter(p => {
        if (p.status !== 'ACTIVE' || new Date(p.startDate) > now || new Date(p.endDate) < now) return false;
        if (p.eligibleVoters === 'OWNERS_ONLY' && resident.ownershipType !== 'OWNER') return false;
        if (p.eligibleVoters === 'TENANTS_ONLY' && resident.ownershipType !== 'TENANT') return false;
        if (p.eligibleVoters === 'COMMITTEE' && user?.role !== 'COMMITTEE_MEMBER') return false;
        return true;
    });

    const votes = await pollRepo.findVotesByVoter(resident._id);
    const votedPollIds = votes.map(v => v.pollId.toString());

    // Only return active polls that the resident hasn't voted on yet
    return activePolls.filter(p => !votedPollIds.includes(p._id.toString()));
};

export const getResidentVotedPolls = async (societyId, userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) return [];

    const user = await User.findById(userId);
    const polls = await pollRepo.getPollsBySociety(societyId);

    const eligiblePolls = polls.filter(p => {
        if (p.eligibleVoters === 'OWNERS_ONLY' && resident.ownershipType !== 'OWNER') return false;
        if (p.eligibleVoters === 'TENANTS_ONLY' && resident.ownershipType !== 'TENANT') return false;
        if (p.eligibleVoters === 'COMMITTEE' && user?.role !== 'COMMITTEE_MEMBER') return false;
        return true;
    });

    const votes = await pollRepo.findVotesByVoter(resident._id);
    const votedPollIds = votes.map(v => v.pollId.toString());

    // Return all polls (active/closed) that the resident has voted on
    return eligiblePolls.filter(p => votedPollIds.includes(p._id.toString()));
};

export const getResidentPollById = async (societyId, pollId, userId) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) throw ApiError.notFound('Poll not found');

    const resident = await residentRepo.findByUserId(userId);
    const user = await User.findById(userId);

    if (poll.eligibleVoters === 'OWNERS_ONLY' && resident?.ownershipType !== 'OWNER') throw ApiError.forbidden('Only owners can view this poll');
    if (poll.eligibleVoters === 'TENANTS_ONLY' && resident?.ownershipType !== 'TENANT') throw ApiError.forbidden('Only tenants can view this poll');
    if (poll.eligibleVoters === 'COMMITTEE' && user?.role !== 'COMMITTEE_MEMBER') throw ApiError.forbidden('Only committee members can view this poll');
    let hasVoted = false;
    let myVote = null;

    if (resident) {
        const vote = await pollRepo.findVote(pollId, resident._id);
        if (vote) {
            hasVoted = true;
            myVote = vote;
        }
    }

    // Hide results if visibility is AFTER_CLOSE and it's active
    let pollObj = poll.toObject();
    if (pollObj.resultVisibility === 'AFTER_CLOSE' && pollObj.status === 'ACTIVE') {
        pollObj.options.forEach(opt => opt.voteCount = undefined);
        pollObj.totalVotes = undefined;
    } else if (pollObj.resultVisibility === 'ADMIN_ONLY') {
        pollObj.options.forEach(opt => opt.voteCount = undefined);
        pollObj.totalVotes = undefined;
    }

    return { poll: pollObj, hasVoted, myVote };
};

export const submitVote = async (societyId, pollId, userId, optionIds) => {
    const poll = await pollRepo.getPollById(pollId, societyId);
    if (!poll) throw ApiError.notFound('Poll not found');
    if (poll.status !== 'ACTIVE') throw ApiError.badRequest('Voting is closed for this poll');

    // Check date bounds
    const now = new Date();
    if (now < poll.startDate || now > poll.endDate) {
        throw ApiError.badRequest('Poll is not within active voting dates');
    }

    // Verify resident
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.unauthorized('Resident profile not found');
    const user = await User.findById(userId);

    // Check eligibility logic
    if (poll.eligibleVoters === 'OWNERS_ONLY' && resident.ownershipType !== 'OWNER') {
        throw ApiError.forbidden('Only owners are allowed to vote in this poll');
    }
    if (poll.eligibleVoters === 'TENANTS_ONLY' && resident.ownershipType !== 'TENANT') {
        throw ApiError.forbidden('Only tenants are allowed to vote in this poll');
    }
    if (poll.eligibleVoters === 'COMMITTEE' && user?.role !== 'COMMITTEE_MEMBER') {
        throw ApiError.forbidden('Only committee members are allowed to vote in this poll');
    }

    // Single vs Multiple choice constraint
    if (poll.votingMethod === 'SINGLE_CHOICE' && optionIds.length > 1) {
        throw ApiError.badRequest('This poll only allows a single choice');
    }
    if (poll.votingMethod === 'MULTIPLE_CHOICE' && optionIds.length > poll.maxChoices) {
        throw ApiError.badRequest(`This poll allows a maximum of ${poll.maxChoices} choices`);
    }

    // Ensure all optionIds exist in the poll
    const validOptionIds = poll.options.map(opt => opt.optionId);
    for (const optId of optionIds) {
        if (!validOptionIds.includes(optId)) {
            throw ApiError.badRequest(`Option ID ${optId} is invalid`);
        }
    }

    // Check if already voted
    const existingVote = await pollRepo.findVote(pollId, resident._id);
    if (existingVote) {
        throw ApiError.badRequest('You have already voted in this poll');
    }

    // Save vote
    await pollRepo.saveVote({
        pollId,
        voterId: resident._id,
        optionIds
    });

    // Increment counts
    const updatedPoll = await pollRepo.incrementPollOptionCount(pollId, societyId, optionIds);

    // Notify via socket if REAL_TIME visibility
    if (updatedPoll.resultVisibility === 'REAL_TIME') {
        const io = getIO();
        if (io) {
            io.to(ROOMS.SOCIETY(societyId)).emit('POLL_UPDATED', { pollId, totalVotes: updatedPoll.totalVotes });
        }
    }

    return updatedPoll;
};
