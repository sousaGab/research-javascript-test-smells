// Your COMPLETE refactored test code here

const ORIGINAL_PRICE = 200;
const EXPECTED_DISCOUNT = 20;

it('calculates discount', () => {
    expect(calculateDiscount(ORIGINAL_PRICE)).toBe(EXPECTED_DISCOUNT);
});