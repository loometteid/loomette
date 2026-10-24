import { MidtransPaymentGateway } from "./adapters/midtrans.adapter";
import { XenditPaymentGateway } from "./adapters/xendit.adapter";
import { StripePaymentGateway } from "./adapters/stripe.adapter";
import { MayarPaymentGateway } from "./adapters/mayar.adapter";
import { MockPaymentGateway } from "./adapters/mock.adapter";
import type { PaymentGateway, PaymentProvider } from "./types";

const instances = new Map<PaymentProvider, PaymentGateway>();

/**
 * Resolves the active payment gateway based on environment variables or explicit provider argument.
 * Defaults to "mock" if PAYMENT_GATEWAY_PROVIDER is not set or during local development without keys.
 */
export function getPaymentGateway(provider?: PaymentProvider): PaymentGateway {
  const activeProvider = (provider ||
    process.env.PAYMENT_GATEWAY_PROVIDER ||
    "mock") as PaymentProvider;

  const existing = instances.get(activeProvider);
  if (existing) {
    return existing;
  }

  let gateway: PaymentGateway;

  switch (activeProvider) {
    case "midtrans":
      gateway = new MidtransPaymentGateway();
      break;
    case "xendit":
      gateway = new XenditPaymentGateway();
      break;
    case "stripe":
      gateway = new StripePaymentGateway();
      break;
    case "mayar":
      gateway = new MayarPaymentGateway();
      break;
    case "mock":
    default:
      gateway = new MockPaymentGateway();
      break;
  }

  instances.set(activeProvider, gateway);
  return gateway;
}

/**
 * Helper to register or override a gateway implementation (useful in unit tests or custom integrations).
 */
export function registerPaymentGateway(
  provider: PaymentProvider,
  gateway: PaymentGateway,
): void {
  instances.set(provider, gateway);
}

/**
 * Clears cached gateway instances (used in testing).
 */
export function resetPaymentGateways(): void {
  instances.clear();
}
