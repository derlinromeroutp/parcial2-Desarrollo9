import { describe, expect, test } from 'bun:test';
import { isPriceAlertTriggered } from './priceAlerts';

describe('isPriceAlertTriggered', () => {
  test('returns true when the current price is lower than the activation price', () => {
    expect(isPriceAlertTriggered(1000, 800)).toBe(true);
  });

  test('returns false when the current price equals the activation price', () => {
    expect(isPriceAlertTriggered(1000, 1000)).toBe(false);
  });

  test('returns false when the current price is higher than the activation price', () => {
    expect(isPriceAlertTriggered(1000, 1200)).toBe(false);
  });
});
