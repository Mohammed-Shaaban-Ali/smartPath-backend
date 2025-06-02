"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateArray = void 0;
const paginateArray = (data, page = 1, limit = 10) => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page > totalPages ? totalPages : page;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const items = data.slice(startIndex, endIndex);
    return {
        items,
        totalItems,
        totalPages,
        currentPage,
        perPage: limit,
    };
};
exports.paginateArray = paginateArray;
