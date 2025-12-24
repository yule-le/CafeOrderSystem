import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

interface StripePaymentFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
}

const StripePaymentForm = ({ onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleCardChange = async (event: any) => {
    // Auto-create payment method when card is complete
    if (event.complete && !processing) {
      await createPaymentMethod();
    }
    if (event.error) {
      onError(event.error.message);
    }
  };

  const createPaymentMethod = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else if (paymentMethod) {
        onSuccess(paymentMethod.id);
      }
    } catch (err: any) {
      onError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="border border-neutral-300 p-4">
      <CardElement
        onChange={handleCardChange}
        options={{
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
        }}
      />
      {processing && (
        <p className="text-xs text-neutral-500 mt-2">Validating card...</p>
      )}
    </div>
  );
};

export default StripePaymentForm;
