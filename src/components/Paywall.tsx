'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Star, Crown, X } from 'lucide-react';
import { Toast } from './Toast';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function Paywall({ isOpen, onClose, feature = 'premium feature' }: PaywallProps) {
  const isDark = false; // Default to light theme
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: ''
  });

  const handlePayment = async (plan: any) => {
    try {
      // First create an order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 59,
          currency: 'INR'
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error('Failed to create order: ' + (orderData.error || 'Unknown error'));
      }

      // Check if Razorpay is already loaded
      if (!(window as any).Razorpay) {
        // Load Razorpay script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = () => resolve(true);
          script.onerror = (error) => reject(error);
        });
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'Thumb-nailer',
        description: `${plan.name} - 3 thumbnails + 5 regenerates`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        callback_url: `${window.location.origin}/api/verify-payment`,
        handler: function (response: any) {
          // Call webhook to verify payment and add credits
          handlePaymentSuccess(response);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          address: 'Thumbnail AI Service'
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function() {}
        }
      };

    
      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Payment Failed',
          message: response.error.description || 'Unknown error occurred'
        });
      });
      
      rzp.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: errorMessage
      });
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Verify payment with your backend
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Payment Successful!',
          message: 'You can now create 3 thumbnails. Credits added to your account.'
        });
        onClose(); // Close paywall after successful payment
        // Optionally refresh the page or update user credits
        window.location.reload();
      } else {
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Payment Verification Failed',
          message: 'Please contact support if the issue persists.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please contact support.';
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Payment Verification Failed',
        message: errorMessage
      });
    }
  };

  const plans = [
    {
      name: 'Starter Pack',
      price: '₹59',
      period: 'one-time',
      description: 'Perfect for creators getting started',
      features: [
        '3 new thumbnails',
        '5 regenerate thumbnails',
        'Advanced AI models',
        '1080p quality',
        'Custom text & branding',
        'CTR optimization',
        'Instant download',
        '7-day support'
      ],
      popular: true,
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      originalPrice: '₹177',
      savings: 'Save ₹118'
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
          isDark ? 'bg-slate-900' : 'bg-white'
        } shadow-2xl`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full flex items-center justify-center transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Header */}
        <div className="text-center p-8 border-b border-slate-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Unlock Premium Features
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Upgrade your plan to access <span className="font-semibold text-orange-500">{feature}</span>
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-xl p-6 ${
                  isDark 
                    ? 'bg-slate-800/60 border border-slate-700/50' 
                    : 'bg-slate-50 border border-slate-200/50'
                } shadow-lg hover:shadow-xl transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -2 }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {plan.name}
                  </h3>
                </div>

                                 {/* Price */}
                 <div className="text-center mb-4">
                   <div className="flex items-baseline justify-center mb-2">
                     <span className={`text-3xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                       {plan.price}
                     </span>
                     <span className={`text-sm ml-1 ${
                       isDark ? 'text-slate-400' : 'text-slate-600'
                     }`}>
                       {plan.period}
                     </span>
                   </div>
                   {plan.originalPrice && (
                     <div className="flex items-center justify-center space-x-2">
                       <span className={`text-lg line-through ${
                         isDark ? 'text-slate-500' : 'text-slate-400'
                       }`}>
                         {plan.originalPrice}
                       </span>
                       <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                         {plan.savings}
                       </span>
                     </div>
                   )}
                 </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      <span className={`${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                                 {/* CTA Button */}
                 <button
                   onClick={() => handlePayment(plan)}
                   className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                     plan.popular
                       ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                       : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                   }`}
                 >
                   {plan.popular ? 'Buy Now - ₹59' : 'Choose Plan'}
                 </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 text-center">
          <p className={`text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </motion.div>
  );
}
