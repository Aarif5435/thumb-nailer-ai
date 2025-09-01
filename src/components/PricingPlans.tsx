'use client';

import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';

export function PricingPlans() {
  const isDark = false; // Default to light theme

  const handlePayment = async (plan: any) => {
    try {
      
      // Check if Razorpay key is available
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        alert('Payment configuration error. Please contact support.');
        return;
      }

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
        throw new Error('Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: razorpayKey,
          amount: orderData.amount, // Amount in paise
          currency: orderData.currency,
          name: 'Thumb-nailer',
          description: `${plan.name} - 3 thumbnails + 5 regenerates`,
          image: '/logo.png',
          order_id: orderData.orderId,
          handler: function (response: any) {
            alert('Payment successful! You can now create 3 thumbnails.');
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
            ondismiss: function() {
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        alert('Failed to load payment system. Please try again.');
      };

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Payment failed: ${errorMessage}`);
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

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Get Started Today
          </motion.h2>
          <motion.p
            className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            One-time payment for 3 professional thumbnails. 
            No monthly subscriptions, no hidden fees.
          </motion.p>
        </div>

        {/* Modern Premium Pricing Design */}
        <div className="relative max-w-5xl mx-auto">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-3xl blur-3xl"></div>
          
          {/* Main Pricing Container */}
          <motion.div
            className="relative bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-3xl p-12 border border-orange-200/50 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Top Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl">
                ⭐ Most Popular Choice
              </div>
            </div>

            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 shadow-xl mb-6">
                {(() => {
                  const IconComponent = plans[0].icon;
                  return <IconComponent className="w-10 h-10 text-white" />;
                })()}
              </div>
              <h3 className={`text-5xl font-black mb-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {plans[0].name}
              </h3>
              <p className={`text-xl ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {plans[0].description}
              </p>
            </div>

            {/* Price Section */}
            <div className="text-center mb-12">
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-8xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {plans[0].price}
                </span>
                <span className={`text-2xl ml-4 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {plans[0].period}
                </span>
              </div>
              {plans[0].originalPrice && (
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-3xl line-through ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {plans[0].originalPrice}
                  </span>
                  <span className="text-lg font-bold text-green-600 bg-green-100 px-4 py-2 rounded-full">
                    {plans[0].savings}
                  </span>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              {plans[0].features.map((feature: string, featureIndex: number) => (
                <motion.div
                  key={featureIndex}
                  className="flex items-center p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * featureIndex, duration: 0.5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-4 shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-lg font-medium ${
                    isDark ? 'text-slate-700' : 'text-slate-700'
                  }`}>
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center mb-8">
              <motion.button
                onClick={() => handlePayment(plans[0])}
                className="group relative px-16 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:scale-105 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className="relative z-10 flex items-center justify-center">
                  🚀 Get Started Now - ₹59
                  <div className="ml-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </span>
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-slate-600 font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-slate-600 font-medium">Instant Access</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-slate-600 font-medium">Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className={`text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Secure payment via Razorpay • UPI, Cards, Net Banking supported
          </p>
        </motion.div>
      </div>
    </div>
  );
}
