import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentForm = ({
  clientSecret,
  onSuccess,
  onError,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const elementOptions = {
    style: {
      base: {
        fontSize: "14px",
        color: "#171717",
        fontFamily: "system-ui, sans-serif",
        "::placeholder": {
          color: "#a3a3a3",
        },
      },
      invalid: {
        color: "#dc2626",
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
          },
        }
      );

      if (error) {
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-4">
        <div className="border border-neutral-300 p-3">
          <CardNumberElement options={elementOptions} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-neutral-300 p-3">
            <CardExpiryElement options={elementOptions} />
          </div>
          <div className="border border-neutral-300 p-3">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-neutral-900 text-white py-3 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing Payment..." : "Pay Now"}
      </button>
    </form>
  );
};

export default StripePaymentForm;
