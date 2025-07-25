// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tourism_app/providers/language_provider.dart';
import 'package:tourism_app/providers/auth_provider.dart';
import 'package:tourism_app/screens/auth/login_screen.dart';
import 'package:tourism_app/screens/auth/register_screen.dart';
import 'package:tourism_app/screens/dashboard/dashboard_screen.dart';
import 'package:tourism_app/screens/splash_screen.dart';
import 'package:tourism_app/utils/app_colors.dart';
import 'package:tourism_app/utils/database_seeder.dart';
import 'package:tourism_app/providers/user_behavior_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize database and seed data
  await DatabaseSeeder.seedDatabase();

  runApp(const MyApp());
}


class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => UserBehaviorProvider()),
      ],
      child: Consumer2<LanguageProvider, AuthProvider>(
        builder: (context, languageProvider, authProvider, _) {
          return MaterialApp(
            title: languageProvider.getText('app_name'),
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: AppColors.primary,
                primary: AppColors.primary,
                secondary: AppColors.accent,
                surface: AppColors.surface,
                background: AppColors.background,
                error: AppColors.error,
              ),
              useMaterial3: true,
              appBarTheme: const AppBarTheme(
                centerTitle: true,
                elevation: 0,
                backgroundColor: AppColors.surface,
                foregroundColor: AppColors.textPrimary,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
              textTheme: const TextTheme(
                headlineLarge: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
                headlineMedium: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
                bodyLarge: TextStyle(color: AppColors.textPrimary),
                bodyMedium: TextStyle(color: AppColors.textSecondary),
              ),
            ),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/dashboard': (context) => const DashboardScreen(),
            },
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}
