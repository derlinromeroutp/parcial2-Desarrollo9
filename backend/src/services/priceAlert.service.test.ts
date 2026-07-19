import { afterEach, describe, expect, mock, test } from 'bun:test';
import { PriceAlert } from '../models/PriceAlert';
import { User } from '../models/User';
import { notifyPriceDrop } from './priceAlert.service';

afterEach(() => {
  mock.restore();
});

describe('notifyPriceDrop service', () => {
  test('marks matching alerts as triggered and leaves non-matching alerts untouched', async () => {
    const droppedAlert: any = {
      _id: 'alert_1',
      userId: 'user_123',
      priceAtActivation: 500,
      triggeredAt: null,
      save: mock(function (this: any) {
        return Promise.resolve(this);
      }),
    };
    const notYetDroppedAlert: any = {
      _id: 'alert_2',
      userId: 'user_456',
      priceAtActivation: 300,
      triggeredAt: null,
      save: mock(function (this: any) {
        return Promise.resolve(this);
      }),
    };

    PriceAlert.find = mock(() => Promise.resolve([droppedAlert, notYetDroppedAlert])) as typeof PriceAlert.find;
    User.findOne = mock(() => Promise.resolve(null)) as typeof User.findOne;

    await notifyPriceDrop('prod_1', 'iPhone 13', 400);

    expect(droppedAlert.triggeredAt).not.toBeNull();
    expect(droppedAlert.save).toHaveBeenCalled();

    expect(notYetDroppedAlert.triggeredAt).toBeNull();
    expect(notYetDroppedAlert.save).not.toHaveBeenCalled();
  });

  test('does nothing when there are no active, un-triggered alerts for the product', async () => {
    PriceAlert.find = mock(() => Promise.resolve([])) as typeof PriceAlert.find;
    const findUser = mock(() => Promise.resolve(null));
    User.findOne = findUser as typeof User.findOne;

    await notifyPriceDrop('prod_1', 'iPhone 13', 400);

    expect(findUser).not.toHaveBeenCalled();
  });
});
