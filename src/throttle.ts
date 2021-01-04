
import Shopify from 'shopify-api-node';
import { ShopifyCallLimit } from './common/types';
import { delay } from './utils';
import { THROTTLE_DELAY_MS } from './constants';

export const getCallLimit = async (shop: Shopify, logging = false): Promise<number> => {
  let callLimit = -1;
  (shop as ShopifyCallLimit).once('callLimits', (currentLimit: { max: number }) => callLimit = currentLimit.max);
  await shop.product.count();
  if (logging) (shop as ShopifyCallLimit).addListener('callLimits', console.log);
  return callLimit;
}

export const throttle = async (shop: Shopify, callLimit: number) => {
  console.log('Waiting for call limit to reset...');

  let remainingCalls: number | undefined = undefined;
  while (!remainingCalls || remainingCalls < callLimit - 1) {
    (shop as ShopifyCallLimit).once('callLimits', ({ remaining }) => {
      console.log(`Remaining: ${remaining}`);
      remainingCalls = remaining;
    });
    await shop.product.count();
    delay(THROTTLE_DELAY_MS);
  }

  console.log('Ready for next calls to send.');
}

