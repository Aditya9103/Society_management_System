import * as pollService from './poll.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

// --- ADMIN CONTROLLERS ---

export const createPoll = asyncHandler(async (req, res) => {
    const poll = await pollService.createPoll(req.user.societyId, req.user.sub, req.body);
    res.status(201).json(new ApiResponse(201, { poll }, 'Poll created successfully'));
});

export const getAdminPolls = asyncHandler(async (req, res) => {
    const polls = await pollService.getAdminPolls(req.user.societyId);
    res.status(200).json(new ApiResponse(200, { polls }, 'Polls retrieved successfully'));
});

export const getAdminPollById = asyncHandler(async (req, res) => {
    const poll = await pollService.getAdminPollById(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, { poll }, 'Poll retrieved successfully'));
});

export const publishPoll = asyncHandler(async (req, res) => {
    const poll = await pollService.publishPoll(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, { poll }, 'Poll published successfully'));
});

export const closePoll = asyncHandler(async (req, res) => {
    const poll = await pollService.closePoll(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, { poll }, 'Poll closed successfully'));
});

export const deletePoll = asyncHandler(async (req, res) => {
    await pollService.deletePoll(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Poll deleted successfully'));
});


// --- RESIDENT CONTROLLERS ---

export const getResidentActivePolls = asyncHandler(async (req, res) => {
    const polls = await pollService.getResidentActivePolls(req.user.societyId, req.user.sub);
    res.status(200).json(new ApiResponse(200, { polls }, 'Active polls retrieved'));
});

export const getResidentVotedPolls = asyncHandler(async (req, res) => {
    const polls = await pollService.getResidentVotedPolls(req.user.societyId, req.user.sub);
    res.status(200).json(new ApiResponse(200, { polls }, 'Voted polls retrieved'));
});

export const getResidentPollById = asyncHandler(async (req, res) => {
    const data = await pollService.getResidentPollById(req.user.societyId, req.params.id, req.user.sub);
    res.status(200).json(new ApiResponse(200, data, 'Poll retrieved'));
});

export const submitVote = asyncHandler(async (req, res) => {
    const poll = await pollService.submitVote(req.user.societyId, req.params.id, req.user.sub, req.body.optionIds);
    res.status(200).json(new ApiResponse(200, { poll }, 'Vote submitted successfully'));
});
