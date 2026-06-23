import VisitorLog from './visitorLog.model.js';

export const createLog = (data) => VisitorLog.create(data);

export const findByVisitor = (visitorId) =>
    VisitorLog.find({ visitorId }).sort({ eventTime: -1 }).lean();
