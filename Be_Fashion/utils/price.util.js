 function calculateVariantFinalPrice(variant) {
  const now = new Date();

  if (
    variant.is_on_sale &&
    variant.sale_percent > 0 &&
    (!variant.sale_start || now >= new Date(variant.sale_start)) &&
    (!variant.sale_end || now <= new Date(variant.sale_end))
  ) {
    if (variant.sale_price) return Number(variant.sale_price);

    return Math.round(
      Number(variant.price) * (1 - variant.sale_percent / 100)
    );
  }

  return Number(variant.price);
}

module.exports = { calculateVariantFinalPrice };
