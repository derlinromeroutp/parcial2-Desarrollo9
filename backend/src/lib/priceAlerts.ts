export const isPriceAlertTriggered = (priceAtActivation: number, currentPrice: number): boolean =>
  currentPrice < priceAtActivation;
