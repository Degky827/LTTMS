/**
 * Authoritative Backend Pricing Calculation Engine
 * Lake Tana Tourism Management System (LTTMS)
 * 
 * Never trusts prices submitted by client/frontend.
 * Computes base price, age-tiered rates (adult vs child), group discounts,
 * and service extra options to produce an immutable pricing snapshot.
 */

function calculatePricing(service, bookingData) {
  const adults = Number(bookingData.adults != null ? bookingData.adults : (bookingData.guests || 1));
  const children = Number(bookingData.children != null ? bookingData.children : 0);
  const totalParticipants = Math.max(1, adults + children);

  const currency = service.currency || 'ETB';
  const baseUnitPrice = Number(service.price || 0);

  // Adult price fallback to base price
  const adultUnitPrice = service.adultPrice != null ? Number(service.adultPrice) : baseUnitPrice;

  // Child price fallback: 50% of adult price or base price
  const childUnitPrice = service.childPrice != null
    ? Number(service.childPrice)
    : Math.round(adultUnitPrice * 0.5);

  let subtotal = 0;

  if (service.pricingUnit === 'per_person') {
    subtotal = (adults * adultUnitPrice) + (children * childUnitPrice);
  } else if (service.pricingUnit === 'per_group') {
    // Flat rate per group booking
    subtotal = baseUnitPrice;
  } else {
    // Default unit multiplication
    subtotal = totalParticipants * baseUnitPrice;
  }

  // Check group pricing tiers for potential discounts
  let groupDiscount = 0;
  if (Array.isArray(service.groupPricing) && service.groupPricing.length > 0) {
    const applicableTier = service.groupPricing.find(tier =>
      totalParticipants >= tier.minGroupSize &&
      (!tier.maxGroupSize || totalParticipants <= tier.maxGroupSize)
    );
    if (applicableTier && applicableTier.pricePerGroup != null) {
      const discountedTotal = Number(applicableTier.pricePerGroup);
      if (discountedTotal < subtotal) {
        groupDiscount = subtotal - discountedTotal;
        subtotal = discountedTotal;
      }
    }
  }

  // Calculate selected options and extra charges
  let extraChargesTotal = 0;
  const itemizedExtraCharges = [];

  if (Array.isArray(bookingData.selectedOptions)) {
    for (const opt of bookingData.selectedOptions) {
      const price = Number(opt.price || 0);
      const qty = Number(opt.quantity || 1);
      const optTotal = price * qty;
      extraChargesTotal += optTotal;
      itemizedExtraCharges.push({
        name: opt.name || 'Additional Option',
        amount: optTotal
      });
    }
  }

  const totalAmount = Math.max(0, subtotal + extraChargesTotal);

  const pricingSnapshot = {
    unitPrice: baseUnitPrice,
    adultPrice: adultUnitPrice,
    childPrice: childUnitPrice,
    groupDiscount,
    extraCharges: itemizedExtraCharges,
    subtotal,
    totalAmount,
    currency
  };

  return {
    adults,
    children,
    totalParticipants,
    pricingSnapshot,
    totalAmount,
    currency,
    priceSnapshot: baseUnitPrice
  };
}

module.exports = {
  calculatePricing
};
