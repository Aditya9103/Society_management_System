/**
 * generateCode.js — Utility to create short, readable unique codes.
 *
 * Usage:
 *   generateCode('TWR')  → 'TWR-A3B9'
 *   generateCode('FLR')  → 'FLR-X2K7'
 *   generateCode('UNIT') → 'UNIT-9P4Q'
 *   generateCode('RES')  → 'RES-MN56'
 */

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0/O, 1/I)

/**
 * Generate a unique code with a given prefix.
 *
 * @param {string} prefix  - Uppercase prefix (e.g. 'TWR', 'FLR', 'UNIT', 'RES')
 * @param {number} [length=4] - Length of the random part
 * @returns {string}  e.g. 'TWR-A3B9'
 */
export const generateCode = (prefix, length = 4) => {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return `${prefix}-${code}`;
};

/**
 * Generate a sequential floor name based on floor number.
 *
 * @param {number} floorNumber - 0 = Ground, negative = Basement
 * @returns {string}  e.g. 'Ground Floor', 'Floor 1', 'Basement 1'
 */
export const floorName = (floorNumber) => {
    if (floorNumber === 0) return 'Ground Floor';
    if (floorNumber < 0) return `Basement ${Math.abs(floorNumber)}`;
    return `Floor ${floorNumber}`;
};
