const Payment = require('../models/Payment');
const axios = require('axios');
require('dotenv').config();

// WaafiPay API configuration
const WAAFI_CONFIG = {
    merchantUid: process.env.WAAFI_MERCHANT_UID,
    apiUserId: process.env.WAAFI_API_USER_ID,
    apiKey: process.env.WAAFI_API_KEY,
    baseUrl: 'https://api.waafipay.net/asm'
};

// Process Hormuud payment integration
async function processHormuudPayment({ booking, place, userFullName, userAccountNo, timeSlot, userId }) {
    try {
        console.log('🔄 Starting Hormuud/WaafiPay payment process...');
        
        // Calculate amounts
        const totalAmount = booking.totalPrice;
        const actualPaidAmount = Math.min(totalAmount, 0.01); // For testing: $0.01, for production: use totalAmount
        
        console.log(`💰 Total amount: $${totalAmount}, Paying: $${actualPaidAmount}`);
        
        // Create payment record
        const payment = new Payment({
            userId: userId,
            userFullName,
            userAccountNo,
            placeId: booking.place,
            placeName: place.name_eng,
            bookingDate: booking.bookingDate,
            timeSlot,
            visitorCount: booking.numberOfPeople,
            pricePerPerson: place.pricePerPerson,
            totalAmount,
            actualPaidAmount,
            bookingStatus: 'pending'
        });

        await payment.save();
        console.log('💾 Payment record created:', payment._id);

        // Process payment with WaafiPay API
        const waafiResult = await processWaafiPayment({
            amount: actualPaidAmount,
            accountNo: userAccountNo,
            description: `Tourism booking for ${place.name_eng} - ${booking.numberOfPeople} visitors`,
            referenceId: payment._id.toString()
        });

        if (waafiResult.success) {
            // Update payment with successful response
            payment.waafiResponse = waafiResult.data;
            payment.bookingStatus = 'confirmed';
            await payment.save();
            
            console.log('✅ WaafiPay payment successful!');
            
            return {
                success: true,
                data: {
                    paymentId: payment._id,
                    totalAmount,
                    actualPaidAmount,
                    bookingStatus: payment.bookingStatus,
                    waafiResponse: waafiResult.data
                }
            };
        } else {
            // Update payment with failed response
            payment.waafiResponse = waafiResult.error;
            payment.bookingStatus = 'failed';
            await payment.save();
            
            console.log('❌ WaafiPay payment failed:', waafiResult.error);
            
            return {
                success: false,
                error: waafiResult.error
            };
        }
    } catch (error) {
        console.error('❌ Hormuud payment processing error:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: 'PAYMENT_PROCESSING_ERROR'
            }
        };
    }
}

// Process payment with WaafiPay API
async function processWaafiPayment(paymentData) {
    try {
        const { amount, accountNo, description, referenceId } = paymentData;

        console.log('📡 Calling WaafiPay API...');
        
        const requestData = {
            schemaVersion: "1.0",
            requestId: `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            channelName: "WEB",
            serviceName: "API_PURCHASE",
            serviceParams: {
                merchantUid: WAAFI_CONFIG.merchantUid,
                apiUserId: WAAFI_CONFIG.apiUserId,
                apiKey: WAAFI_CONFIG.apiKey,
                paymentMethod: "mwallet_account",
                payerInfo: {
                    accountNo: accountNo
                },
                transactionInfo: {
                    referenceId: referenceId,
                    invoiceId: `INV_${referenceId}`,
                    amount: amount,
                    currency: "USD",
                    description: description
                }
            }
        };

        console.log('📤 WaafiPay request:', {
            amount,
            accountNo,
            referenceId,
            merchantUid: WAAFI_CONFIG.merchantUid
        });

        const response = await axios.post(WAAFI_CONFIG.baseUrl, requestData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });

        console.log('📥 WaafiPay response:', response.data);

        if (response.data && response.data.responseCode === '2001') {
            return {
                success: true,
                data: {
                    referenceId: response.data.params?.referenceId,
                    transactionId: response.data.params?.transactionId,
                    issuerTransactionId: response.data.params?.issuerTransactionId,
                    state: response.data.params?.state,
                    responseCode: response.data.responseCode,
                    responseMsg: response.data.responseMsg,
                    merchantCharges: response.data.params?.merchantCharges,
                    txAmount: response.data.params?.txAmount
                }
            };
        } else {
            return {
                success: false,
                error: {
                    responseCode: response.data?.responseCode,
                    responseMsg: response.data?.responseMsg || 'Payment failed'
                }
            };
        }
    } catch (error) {
        console.error('❌ WaafiPay API error:', error.message);
        return {
            success: false,
            error: {
                responseCode: 'NETWORK_ERROR',
                responseMsg: error.message || 'Network error occurred'
            }
        };
    }
}

module.exports = {
    processHormuudPayment,
    processWaafiPayment
};
