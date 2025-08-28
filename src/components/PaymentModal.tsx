import React, { useState } from "react";
import { X, CreditCard, Smartphone, Lock } from "lucide-react";
import { SubscriptionPlan, PaymentMethod } from "@/types/subscription";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onPaymentSuccess: (paymentMethod: PaymentMethod) => void;
  isLoading?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
  isLoading = false,
}: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState<"card" | "momo">("card");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with actual payment providers
    const paymentMethod: PaymentMethod = {
      id: "temp-id",
      type: paymentType,
      provider: paymentType === "momo" ? "momo" : "stripe",
      phoneNumber: paymentType === "momo" ? phoneNumber : undefined,
      last4: paymentType === "card" ? cardNumber.slice(-4) : undefined,
      brand: paymentType === "card" ? "visa" : undefined,
      isDefault: true,
    };
    onPaymentSuccess(paymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
          <div className="text-purple-200">
            <span className="text-2xl font-bold">${plan.price}</span>
            <span>/{plan.interval}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type Selection */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentType("card")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                paymentType === "card"
                  ? "bg-purple-500/20 border-purple-400 text-white"
                  : "bg-white/10 border-white/30 text-white/60 hover:bg-white/20"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentType("momo")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                paymentType === "momo"
                  ? "bg-purple-500/20 border-purple-400 text-white"
                  : "bg-white/10 border-white/30 text-white/60 hover:bg-white/20"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              MoMo
            </button>
          </div>

          {paymentType === "card" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Mobile Money Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+233 XX XXX XXXX"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
              <p className="text-xs text-purple-200 mt-2">
                You&apos;ll receive a prompt on your phone to complete the
                payment
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${plan.price}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-purple-200">
            Your payment is secured with bank-level encryption
          </p>
        </div>
      </div>
    </div>
  );
}
