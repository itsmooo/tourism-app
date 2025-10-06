import 'package:http/http.dart' as http;
import 'dart:convert';

class BookingService {
  static const String baseUrl =
      'https://tourism-app-ruddy.vercel.app/api/bookings';

  /// Create a new booking with optional payment info
  static Future<Map<String, dynamic>> createBooking({
    required String userId,
    required String placeId,
    required String bookingDate,
    required int numberOfPeople,
    String? authToken,
    String? userFullName,
    String? userAccountNo,
    String? timeSlot,
  }) async {
    try {
      print(
          '🔄 Creating booking: placeId=$placeId, date=$bookingDate, people=$numberOfPeople');

      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
        print('🔑 Using auth token: ${authToken.substring(0, 20)}...');
      } else {
        print('⚠️ No auth token provided');
      }

      final requestBody = {
        'placeId': placeId,
        'bookingDate': bookingDate,
        'numberOfPeople': numberOfPeople,
      };

      // Add payment info if provided
      if (userFullName != null && userAccountNo != null && timeSlot != null) {
        requestBody['userFullName'] = userFullName;
        requestBody['userAccountNo'] = userAccountNo;
        requestBody['timeSlot'] = timeSlot;
        print('💳 Including Hormuud payment info in booking request');
      }

      print('📤 Request body: $requestBody');

      final response = await http
          .post(
            Uri.parse(baseUrl),
            headers: headers,
            body: json.encode(requestBody),
          )
          .timeout(const Duration(seconds: 30));

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      final responseData = json.decode(response.body);

      if (response.statusCode == 201) {
        print('✅ Booking created successfully');
        return {
          'success': true,
          'data': responseData['data'] ?? responseData,
          'message': responseData['message'] ?? 'Booking created successfully',
        };
      } else {
        print('❌ Booking failed: ${responseData['message']}');
        return {
          'success': false,
          'message': responseData['message'] ?? 'Booking failed',
          'data': responseData['data'],
          'statusCode': response.statusCode,
        };
      }
    } catch (e) {
      print('❌ Booking creation error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
        'error': e.toString(),
      };
    }
  }

  /// Get user's bookings
  static Future<Map<String, dynamic>> getUserBookings({
    required String userId,
    String? authToken,
  }) async {
    try {
      print('🔄 Getting bookings for user: $userId');

      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
        print('🔑 Using auth token for bookings');
      }

      final url = '$baseUrl/user/$userId';
      print('📤 GET request to: $url');

      final response = await http
          .get(
            Uri.parse(url),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      print('📥 Get bookings response status: ${response.statusCode}');
      print('📥 Get bookings response body: ${response.body}');

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        print(
            '✅ Bookings retrieved successfully: ${responseData.length} bookings');
        return {
          'success': true,
          'data': responseData,
        };
      } else {
        print('❌ Failed to get bookings: ${responseData['message']}');
        return {
          'success': false,
          'message': responseData['message'] ?? 'Failed to load bookings',
          'statusCode': response.statusCode,
        };
      }
    } catch (e) {
      print('❌ Get bookings error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
        'error': e.toString(),
      };
    }
  }

  /// Get booking details by ID
  static Future<Map<String, dynamic>> getBookingDetails({
    required String bookingId,
    String? authToken,
  }) async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }

      final response = await http
          .get(
            Uri.parse('$baseUrl/$bookingId'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': responseData,
        };
      } else {
        return {
          'success': false,
          'message':
              responseData['message'] ?? 'Failed to load booking details',
        };
      }
    } catch (e) {
      print('❌ Get booking details error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  /// Update booking status
  static Future<Map<String, dynamic>> updateBookingStatus({
    required String bookingId,
    required String status,
    String? authToken,
  }) async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }

      final response = await http
          .put(
            Uri.parse('$baseUrl/$bookingId/status'),
            headers: headers,
            body: json.encode({
              'status': status,
            }),
          )
          .timeout(const Duration(seconds: 30));

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': responseData,
          'message': 'Booking status updated successfully',
        };
      } else {
        return {
          'success': false,
          'message':
              responseData['message'] ?? 'Failed to update booking status',
        };
      }
    } catch (e) {
      print('❌ Update booking status error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  /// Cancel a booking
  static Future<Map<String, dynamic>> cancelBooking({
    required String bookingId,
    String? authToken,
  }) async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }

      final response = await http
          .delete(
            Uri.parse('$baseUrl/$bookingId'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Booking cancelled successfully',
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Failed to cancel booking',
        };
      }
    } catch (e) {
      print('❌ Cancel booking error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  /// Initiate payment for booking (Hormuud/WaafiPay)
  static Future<Map<String, dynamic>> initiatePayment({
    required String bookingId,
    String? authToken,
  }) async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }

      final response = await http
          .post(
            Uri.parse('$baseUrl/payment/initiate'),
            headers: headers,
            body: json.encode({
              'bookingId': bookingId,
            }),
          )
          .timeout(const Duration(seconds: 30));

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': responseData,
          'message': 'Payment initiated successfully',
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Failed to initiate payment',
        };
      }
    } catch (e) {
      print('❌ Initiate payment error: $e');
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }
}
