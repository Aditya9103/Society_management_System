import Poll from './poll.model.js';
import Vote from './vote.model.js';

export const createPoll = async (data) => {
    return Poll.create(data);
};

export const getPollsBySociety = async (societyId) => {
    // Exclude large base64 image strings from list API to prevent slow load times
    return Poll.find({ societyId }).select('-options.photoUrl').sort({ createdAt: -1 });
};

export const getPollById = async (id, societyId) => {
    return Poll.findOne({ _id: id, societyId }).populate('createdBy', 'firstName lastName email');
};

export const updatePoll = async (id, societyId, updateData) => {
    return Poll.findOneAndUpdate({ _id: id, societyId }, updateData, { new: true });
};

export const deletePoll = async (id, societyId) => {
    return Poll.findOneAndDelete({ _id: id, societyId });
};

export const findVote = async (pollId, voterId) => {
    return Vote.findOne({ pollId, voterId });
};

export const findVotesByVoter = async (voterId) => {
    return Vote.find({ voterId });
};

export const saveVote = async (voteData) => {
    return Vote.create(voteData);
};

export const getVotesForPoll = async (pollId) => {
    return Vote.find({ pollId });
};

export const incrementPollOptionCount = async (pollId, societyId, optionIds) => {
    // MongoDB arrayFilters feature to increment specific elements in an array
    const updates = {};
    const arrayFilters = [];
    
    optionIds.forEach((optId, index) => {
        updates[`options.$[elem${index}].voteCount`] = 1;
        arrayFilters.push({ [`elem${index}.optionId`]: optId });
    });

    return Poll.findOneAndUpdate(
        { _id: pollId, societyId },
        { 
            $inc: { ...updates, totalVotes: 1 } 
        },
        { 
            arrayFilters, 
            new: true 
        }
    );
};
