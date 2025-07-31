export const COUPON_CODES = {
    BLACK_FIRDAY :"FRIDAYCC22",

} as const;
export type CouponCode = (typeof COUPON_CODES)[keyof typeof COUPON_CODES];