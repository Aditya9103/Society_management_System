import Unit from '../models/Unit.js';

export const findById = (id) => {
    return Unit.findById(id).lean();
};
