import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class UserActivityService {
  static const String _lastActivityKey = 'last_activity_time';
  static const String _sessionStartKey = 'session_start_time';
  static const String _isActiveKey = 'is_active';

  // Update user activity status
  static Future<void> updateActivityStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final now = DateTime.now();

      // Store current activity time
      await prefs.setString(_lastActivityKey, now.toIso8601String());
      await prefs.setBool(_isActiveKey, true);

      // Check if this is a new session (first activity after being inactive)
      final lastActivityStr = prefs.getString(_lastActivityKey);
      final sessionStartStr = prefs.getString(_sessionStartKey);

      bool isNewSession = false;
      if (lastActivityStr != null && sessionStartStr != null) {
        final lastActivity = DateTime.parse(lastActivityStr);
        final sessionStart = DateTime.parse(sessionStartStr);

        // If last activity was more than 30 minutes ago, this is a new session
        if (now.difference(lastActivity).inMinutes > 30) {
          isNewSession = true;
          await prefs.setString(_sessionStartKey, now.toIso8601String());
        }
      } else {
        // First time setting activity
        isNewSession = true;
        await prefs.setString(_sessionStartKey, now.toIso8601String());
      }

      // Send activity update to server if user is authenticated
      if (await _isUserAuthenticated()) {
        await _sendActivityToServer(isNewSession);
      }

      print('[UserActivity] Activity updated - New session: $isNewSession');
    } catch (e) {
      print('[UserActivity] Error updating activity: $e');
    }
  }

  // Check if user is authenticated
  static Future<bool> _isUserAuthenticated() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final user = prefs.getString('user');
      return token != null && user != null;
    } catch (e) {
      print('[UserActivity] Error checking authentication: $e');
      return false;
    }
  }

  // Send activity update to server
  static Future<void> _sendActivityToServer(bool isNewSession) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token != null) {
        // Use localhost for activity updates (same as other localhost endpoints)
        final baseUrl = 'http://localhost:9000/api';

        final response = await http.put(
          Uri.parse('$baseUrl/auth/activity'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: json.encode({
            'isNewSession': isNewSession,
            'timestamp': DateTime.now().toIso8601String(),
          }),
        );

        if (response.statusCode == 200) {
          print('[UserActivity] Server activity updated successfully');
        } else {
          print(
              '[UserActivity] Failed to update server activity: ${response.statusCode}');
        }
      }
    } catch (e) {
      print('[UserActivity] Error sending activity to server: $e');
    }
  }

  // Check if user is currently active
  static Future<bool> isUserActive() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastActivityStr = prefs.getString(_lastActivityKey);

      if (lastActivityStr == null) return false;

      final lastActivity = DateTime.parse(lastActivityStr);
      final now = DateTime.now();

      // Consider user active if last activity was within 30 minutes
      return now.difference(lastActivity).inMinutes <= 30;
    } catch (e) {
      print('[UserActivity] Error checking activity status: $e');
      return false;
    }
  }

  // Get last activity time
  static Future<DateTime?> getLastActivityTime() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastActivityStr = prefs.getString(_lastActivityKey);

      if (lastActivityStr == null) return null;

      return DateTime.parse(lastActivityStr);
    } catch (e) {
      print('[UserActivity] Error getting last activity time: $e');
      return null;
    }
  }

  // Mark user as inactive (when app is closed or backgrounded)
  static Future<void> markInactive() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_isActiveKey, false);

      print('[UserActivity] User marked as inactive');
    } catch (e) {
      print('[UserActivity] Error marking user inactive: $e');
    }
  }

  // Get session duration
  static Future<Duration?> getSessionDuration() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionStartStr = prefs.getString(_sessionStartKey);

      if (sessionStartStr == null) return null;

      final sessionStart = DateTime.parse(sessionStartStr);
      final now = DateTime.now();

      return now.difference(sessionStart);
    } catch (e) {
      print('[UserActivity] Error getting session duration: $e');
      return null;
    }
  }
}
