import React from "react";
import { Check, Crown } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentPlan?: string;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isLoading?: boolean;
}

export default function SubscriptionPlans({
  plans,
  currentPlan,
  onSelectPlan,
  isLoading = false,
}: SubscriptionPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border transition-all duration-200 hover:scale-105 ${
            plan.popular
              ? "border-yellow-400/50 shadow-lg shadow-yellow-500/20"
              : "border-white/20"
          } ${currentPlan === plan.id ? "ring-2 ring-purple-400" : ""}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Most Popular
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">
                ${plan.price}
              </span>
              <span className="text-purple-200">/{plan.interval}</span>
            </div>
            {currentPlan === plan.id && (
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-2 mb-4">
                <span className="text-green-200 text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-purple-100 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-6 text-xs text-purple-200">
            <div className="flex justify-between">
              <span>Questions per day:</span>
              <span className="font-medium">{plan.limits.questionsPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span>Documents per month:</span>
              <span className="font-medium">
                {plan.limits.documentsPerMonth}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max questions per quiz:</span>
              <span className="font-medium">
                {plan.limits.maxQuestionsPerQuiz}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan(plan)}
            disabled={isLoading || currentPlan === plan.id}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              currentPlan === plan.id
                ? "bg-green-500/20 text-green-200 border border-green-400/50 cursor-not-allowed"
                : plan.popular
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : currentPlan === plan.id ? (
              "Current Plan"
            ) : (
              "Choose Plan"
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
