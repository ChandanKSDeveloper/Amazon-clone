import React from 'react';
import { Check, MapPin, ClipboardList, CreditCard } from 'lucide-react';

const steps = [
    { label: "Shipping", icon: MapPin },
    { label: "Confirm Order", icon: ClipboardList },
    { label: "Payment", icon: CreditCard },
];

export default function CheckoutSteps({ activeStep }) {
    return (
        <div className="flex items-center justify-center w-full max-w-2xl mx-auto py-8 px-4">
            {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;

                return (
                    <div key={step.label} className="flex items-center flex-1 last:flex-none">
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2
                                transition-all duration-300 text-sm
                                ${isCompleted
                                    ? 'bg-[#067D62] border-[#067D62] text-white'
                                    : isActive
                                        ? 'bg-[#FFD814] border-[#FFD814] text-[#0F1111]'
                                        : 'bg-white border-gray-300 text-gray-500'
                                }
                            `}>
                                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                            </div>
                            <span className={`
                                mt-2 text-xs font-bold whitespace-nowrap
                                ${isCompleted ? 'text-[#067D62]'
                                    : isActive ? 'text-[#0F1111]'
                                        : 'text-gray-500'}
                            `}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className={`
                                flex-1 h-[2px] mx-2 mb-6 transition-all duration-300
                                ${index < activeStep
                                    ? 'bg-[#067D62]'
                                    : 'bg-gray-300'}
                            `} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}