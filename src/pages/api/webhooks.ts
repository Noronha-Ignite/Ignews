import { NextApiResponse, NextApiRequest } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

enum RelevantEvents {
  CheckoutSessionCompleted = 'checkout.session.completed',
  CustomerSubscriptionDeleted = 'customer.subscription.deleted',
  CustomerSubscriptionUpdated = 'customer.subscription.updated',
}

const relevantEvents = new Set<string>([
  RelevantEvents.CheckoutSessionCompleted,
  RelevantEvents.CustomerSubscriptionDeleted,
  RelevantEvents.CustomerSubscriptionUpdated,
]);

export default async function Webhooks(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') return response.status(405).end('Method not Allowed');

  const buff = await buffer(request);
  const secret = request.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buff, secret, process.env.STRIPE_WEBHOOK_SECRET);
  } catch(err) {
    return response.status(400).send(`Webhook error: ${ err.mensage }`);
  }
  
  const { type } = event;

  if (relevantEvents.has(type)) {
    try {
      switch(type as RelevantEvents){
        case RelevantEvents.CustomerSubscriptionDeleted:
        case RelevantEvents.CustomerSubscriptionUpdated:

          const subscription = event.data.object as Stripe.Subscription;

          await saveSubscription({
            subscriptionId: subscription.id,
            customerId: subscription.customer.toString(),
          });

          break;
        case RelevantEvents.CheckoutSessionCompleted:

          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          await saveSubscription({
            subscriptionId: checkoutSession.subscription.toString(),
            customerId: checkoutSession.customer.toString(),
            createAction: true
          });

          break
        default:
          throw new Error('Unhandled event')
      }
    } catch(err) {
      return response.json({ error: err.message ?? 'Webhook handler failed' })
    }
  }

  return response.json({ received: true });
}