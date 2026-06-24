import DomesticStaff from './domesticStaff.model.js';

export const create = (data) => DomesticStaff.create(data);

export const findById = (id) => DomesticStaff.findById(id).lean();

export const findByResident = (registeredBy) => 
    DomesticStaff.find({ registeredBy }).sort({ createdAt: -1 }).lean();

export const updateById = (id, updateData) => 
    DomesticStaff.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

export const deleteById = (id) => DomesticStaff.findByIdAndDelete(id).lean();
