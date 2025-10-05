# Real Payment Setup Guide

## 🚀 Switching from Mock to Real Payments

Your tourism app is now configured to use **real payments** with WaafiPay/Hormuud integration instead of mock payments.

## 📋 What Changed

1. **Removed Mock Payment Fallback**: The app no longer falls back to mock payments when real payments fail
2. **Real Payment Integration**: All payments now go through the WaafiPay API for actual money transactions
3. **Proper Amount Calculation**: Payment amounts are calculated based on actual place prices

## 🔧 Backend Configuration Required

To enable real payments, you need to configure your WaafiPay credentials in your backend:

### 1. Create Environment File
Create a `.env` file in your `tourism_app/node-server/` directory with:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/tourism_app

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# WaafiPay/Hormuud Payment Gateway Configuration
WAAFI_MERCHANT_UID=your_merchant_uid_here
WAAFI_API_USER_ID=your_api_user_id_here
WAAFI_API_KEY=your_api_key_here

# Server Configuration
PORT=9000
NODE_ENV=development
```

### 2. Get WaafiPay Credentials
1. Sign up for a WaafiPay merchant account
2. Get your Merchant UID, API User ID, and API Key from the dashboard
3. Replace the placeholder values in your `.env` file

### 3. Start Backend Server
```bash
cd tourism_app/node-server
npm install
npm start
```

## 💰 How Real Payments Work

### Payment Flow:
1. **User Books**: User selects place, date, time, and number of visitors
2. **Amount Calculation**: Total amount = `visitorCount × pricePerPerson`
3. **WaafiPay API Call**: Real payment request sent to WaafiPay
4. **Money Deducted**: Actual money is deducted from user's Hormuud account
5. **Booking Confirmed**: Booking is confirmed with real payment

### Payment Status:
- ✅ **Success**: Real money deducted, booking confirmed
- ❌ **Failed**: Payment declined/failed, booking not confirmed
- ⏳ **Pending**: Payment processing, booking on hold

## 🔍 Testing Real Payments

### For Testing:
1. Use real Hormuud mobile money accounts
2. Ensure accounts have sufficient balance
3. Test with small amounts first
4. Check payment status in dashboard

### Payment Information Required:
- **User Full Name**: Customer's real name
- **Account Number**: Hormuud mobile money account number
- **Amount**: Real money amount based on place pricing

## 📱 User Experience

### Before (Mock Payments):
- Always succeeded with $0.01
- No real money involved
- Instant "success" regardless of account status

### After (Real Payments):
- Real money transactions
- Actual account validation
- Real success/failure based on payment gateway response
- Proper error handling for insufficient funds, invalid accounts, etc.

## 🛡️ Security Features

1. **Real Account Validation**: WaafiPay validates actual Hormuud accounts
2. **Secure API Calls**: All payment requests go through encrypted WaafiPay API
3. **Transaction Tracking**: Each payment has unique transaction ID
4. **Error Handling**: Proper handling of payment failures and timeouts

## 📊 Dashboard Integration

The dashboard will now show:
- Real payment amounts instead of $0.01
- Actual payment status (success/failed/pending)
- Real transaction IDs from WaafiPay
- Proper booking confirmations

## ⚠️ Important Notes

1. **Real Money**: Payments now involve actual money transactions
2. **Account Balance**: Users need sufficient balance in their Hormuud accounts
3. **Network Dependency**: Requires stable internet for WaafiPay API calls
4. **Error Handling**: Failed payments will show appropriate error messages

## 🔧 Troubleshooting

### Payment Fails:
- Check WaafiPay credentials in `.env`
- Verify backend server is running
- Ensure user has sufficient balance
- Check network connection

### Backend Errors:
- Verify WaafiPay API credentials
- Check MongoDB connection
- Ensure all environment variables are set

## 📞 Support

For WaafiPay integration issues:
- Contact WaafiPay support for API credentials
- Check WaafiPay documentation for API changes
- Verify merchant account status

---

**🎉 Congratulations!** Your tourism app now processes real payments with actual money transactions through WaafiPay/Hormuud integration!
