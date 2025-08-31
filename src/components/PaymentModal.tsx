import React, { useState } from "react";
import { X, CreditCard, Lock, Shield, Check, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    price: string;
    period: string;
    popular?: boolean;
    savings?: string;
  };
  onPaymentSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  supported: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [momoDetails, setMomoDetails] = useState({
    phone: "",
    provider: "mtn", // mtn, vodafone, airtel
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
      supported: true,
    },
    {
      id: "momo",
      name: "Mobile Money",
      icon: "📱",
      description: "MTN, Vodafone, Airtel Money",
      supported: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      description: "Direct bank transfer",
      supported: true,
    },
  ];

  const momoProviders = [
    { id: "mtn", name: "MTN Mobile Money", icon: "🟡" },
    { id: "vodafone", name: "Vodafone Cash", icon: "🔴" },
    { id: "airtel", name: "Airtel Money", icon: "🔵" },
  ];

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry date
    if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formattedValue.length > 5) return;
    }

    // Format CVV
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setCardDetails((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const validateCardDetails = () => {
    if (!cardDetails.number.replace(/\s/g, "").match(/^\d{16}$/)) {
      return "Please enter a valid 16-digit card number";
    }
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      return "Please enter a valid expiry date (MM/YY)";
    }
    if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
      return "Please enter a valid CVV";
    }
    if (!cardDetails.name.trim()) {
      return "Please enter the cardholder name";
    }
    return null;
  };

  const validateMomoDetails = () => {
    if (!momoDetails.phone.match(/^\d{10}$/)) {
      return "Please enter a valid 10-digit phone number";
    }
    return null;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError("");

    try {
      let validationError = null;

      if (selectedPaymentMethod === "card") {
        validationError = validateCardDetails();
      } else if (selectedPaymentMethod === "momo") {
        validationError = validateMomoDetails();
      }

      if (validationError) {
        setPaymentError(validationError);
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production, this would integrate with a real payment processor
      // For now, we'll simulate a successful payment
      console.log("Payment processed successfully", {
        method: selectedPaymentMethod,
        plan: selectedPlan,
        details: selectedPaymentMethod === "card" ? cardDetails : momoDetails,
      });

      onPaymentSuccess();
    } catch {
      setPaymentError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Complete Payment
              </h2>
              <p className="text-slate-300 text-sm">
                Upgrade to Pro - {selectedPlan.name} Plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedPlan.name} Plan
                </h3>
                <p className="text-purple-200 text-sm">
                  Unlimited access to all features
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {selectedPlan.price}
                </div>
                <div className="text-purple-200 text-sm">
                  {selectedPlan.period}
                </div>
                {selectedPlan.savings && (
                  <div className="text-green-400 text-sm font-medium">
                    {selectedPlan.savings}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              Choose Payment Method
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPaymentMethod === method.id
                      ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      : "border-white/20 bg-white/10 hover:border-purple-400/50"
                  } ${
                    !method.supported ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() =>
                    method.supported && setSelectedPaymentMethod(method.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{method.name}</h4>
                      <p className="text-slate-300 text-sm">
                        {method.description}
                      </p>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          {selectedPaymentMethod === "card" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Card Details</h3>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) =>
                    handleCardInputChange("number", e.target.value)
                  }
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      handleCardInputChange("expiry", e.target.value)
                    }
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      handleCardInputChange("cvv", e.target.value)
                    }
                    placeholder="123"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) =>
                    handleCardInputChange("name", e.target.value)
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {selectedPaymentMethod === "momo" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">
                Mobile Money Details
              </h3>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Mobile Money Provider
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {momoProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                        momoDetails.provider === provider.id
                          ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                          : "border-white/20 bg-white/10 hover:border-purple-400/50"
                      }`}
                      onClick={() =>
                        setMomoDetails((prev) => ({
                          ...prev,
                          provider: provider.id,
                        }))
                      }
                    >
                      <div className="text-2xl mb-1">{provider.icon}</div>
                      <div className="text-white text-sm font-medium">
                        {provider.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={momoDetails.phone}
                  onChange={(e) =>
                    setMomoDetails((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="0241234567"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {selectedPaymentMethod === "bank" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Bank Transfer</h3>
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    Bank Transfer Details
                  </h4>
                  <p className="text-blue-200 text-sm mb-4">
                    You will receive bank transfer details after clicking
                    &quot;Pay Now&quot;
                  </p>
                  <div className="text-left space-y-2 text-sm text-blue-100">
                    <div>• Transfer amount: {selectedPlan.price}</div>
                    <div>
                      • Reference: STUDYAI-{Date.now().toString().slice(-6)}
                    </div>
                    <div>• Processing time: 1-3 business days</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {paymentError && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span>{paymentError}</span>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Lock className="w-4 h-4" />
              <span>
                256-bit SSL encryption • PCI DSS compliant • Your data is secure
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay {selectedPlan.price}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
