// Real-world table dimensions, mapped to pixels so the floor plan is to scale.
// Tweak PX_PER_M to make every table grow/shrink together.
export const PX_PER_M = 80;

export const RECT_WIDTH_M = 1;      // table depth (short side)
export const RECT_LENGTH_M = 2.5;   // long side — guests sit along this
export const ROUND_DIAMETER_M = 1.8;

export const RECT_WIDTH_PX = RECT_WIDTH_M * PX_PER_M;     // 80
export const RECT_LENGTH_PX = RECT_LENGTH_M * PX_PER_M;   // 200
export const ROUND_DIAMETER_PX = ROUND_DIAMETER_M * PX_PER_M; // 144
