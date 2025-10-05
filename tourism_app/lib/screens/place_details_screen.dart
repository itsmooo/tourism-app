import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tourism_app/providers/language_provider.dart';
import 'package:tourism_app/providers/favorites_provider.dart';
import 'package:tourism_app/providers/auth_provider.dart';
import 'package:tourism_app/services/payment_service.dart'; // Using real payment service
import 'package:tourism_app/services/booking_service.dart';
import 'package:tourism_app/utils/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:tourism_app/screens/dashboard/dashboard_screen.dart';

class PlaceDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> place;

  const PlaceDetailsScreen({
    Key? key,
    required this.place,
  }) : super(key: key);

  @override
  State<PlaceDetailsScreen> createState() => _PlaceDetailsScreenState();
}

class _PlaceDetailsScreenState extends State<PlaceDetailsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late PageController _pageController;
  int _currentImageIndex = 0;
  bool _isFavorite = false;
  bool _isLoading = false;

  // Booking form controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  DateTime? _selectedDate;
  String? _selectedTimeSlot;
  int _visitorCount = 1;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _pageController = PageController();
    _checkFavoriteStatus();
    _loadBookingData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pageController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _checkFavoriteStatus() async {
    final favoritesProvider =
        Provider.of<FavoritesProvider>(context, listen: false);
    final isFavorite = await favoritesProvider
        .isFavorite(widget.place['_id'] ?? widget.place['id'] ?? '');
    if (mounted) {
      setState(() {
        _isFavorite = isFavorite;
      });
    }
  }

  void _loadBookingData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.currentUser;
    if (user != null) {
      setState(() {
        _nameController.text = user['full_name'] ?? user['username'] ?? '';
        _phoneController.text = user['phone'] ?? user['account_number'] ?? '';
      });
    }
  }

  void _toggleFavorite() async {
    final favoritesProvider =
        Provider.of<FavoritesProvider>(context, listen: false);
    final placeId = widget.place['_id'] ?? widget.place['id'] ?? '';

    if (_isFavorite) {
      await favoritesProvider.removeFromFavorites(placeId);
    } else {
      await favoritesProvider.addToFavorites(placeId, widget.place);
    }

    setState(() {
      _isFavorite = !_isFavorite;
    });
  }

  void _showBookingModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildBookingModal(),
    );
  }

  Widget _buildBookingModal() {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            margin: EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Book ${widget.place['name_eng'] ?? widget.place['name'] ?? 'Place'}',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  SizedBox(height: 20),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildBookingForm(),
                          SizedBox(height: 30),
                          _buildPriceSummary(),
                          SizedBox(height: 30),
                          _buildBookButton(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInputField(
          'Full Name',
          _nameController,
          Icons.person,
          'Enter your full name',
        ),
        SizedBox(height: 16),
        _buildInputField(
          'Phone Number',
          _phoneController,
          Icons.phone,
          'Enter your phone number',
        ),
        SizedBox(height: 16),
        _buildDateSelector(),
        SizedBox(height: 16),
        _buildTimeSlotSelector(),
        SizedBox(height: 16),
        _buildVisitorCountSelector(),
      ],
    );
  }

  Widget _buildInputField(
    String label,
    TextEditingController controller,
    IconData icon,
    String hint,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: hint,
              prefixIcon: Icon(icon, color: AppColors.primary),
              border: InputBorder.none,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDateSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Date',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        SizedBox(height: 8),
        InkWell(
          onTap: _selectDate,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today, color: AppColors.primary),
                SizedBox(width: 12),
                Text(
                  _selectedDate != null
                      ? DateFormat('MMM dd, yyyy').format(_selectedDate!)
                      : 'Select a date',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    color:
                        _selectedDate != null ? Colors.black : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSlotSelector() {
    final timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Time Slot',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: timeSlots.map((slot) {
            final isSelected = _selectedTimeSlot == slot;
            return InkWell(
              onTap: () => setState(() => _selectedTimeSlot = slot),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.grey[100],
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : Colors.grey[300]!,
                  ),
                ),
                child: Text(
                  slot,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    color: isSelected ? Colors.white : Colors.grey[700],
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildVisitorCountSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Number of Visitors',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            IconButton(
              onPressed: _visitorCount > 1
                  ? () => setState(() => _visitorCount--)
                  : null,
              icon: Icon(Icons.remove_circle_outline, color: AppColors.primary),
            ),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _visitorCount.toString(),
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
            IconButton(
              onPressed: _visitorCount < 10
                  ? () => setState(() => _visitorCount++)
                  : null,
              icon: Icon(Icons.add_circle_outline, color: AppColors.primary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPriceSummary() {
    final pricePerPerson = (widget.place['pricePerPerson'] ?? 5.0).toDouble();
    final totalAmount = pricePerPerson * _visitorCount;

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Booking Summary',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Price per person',
                style:
                    GoogleFonts.poppins(fontSize: 16, color: Colors.grey[700]),
              ),
              Text(
                '\$${pricePerPerson.toStringAsFixed(2)}',
                style: GoogleFonts.poppins(
                    fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Visitors (${_visitorCount})',
                style:
                    GoogleFonts.poppins(fontSize: 16, color: Colors.grey[700]),
              ),
              Text(
                '${_visitorCount}x',
                style: GoogleFonts.poppins(
                    fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Amount',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              Text(
                '\$${totalAmount.toStringAsFixed(2)}',
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBookButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleBookNow,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: _isLoading
            ? CircularProgressIndicator(color: Colors.white)
            : Text(
                'Book Now - \$${((widget.place['pricePerPerson'] ?? 5.0) * _visitorCount).toStringAsFixed(2)}',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }

  void _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 365)),
    );
    if (date != null) {
      setState(() {
        _selectedDate = date;
      });
    }
  }

  Future<void> _handleBookNow() async {
    // Validation
    if (_nameController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter your full name');
      return;
    }
    if (_phoneController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter your phone number');
      return;
    }
    if (_selectedDate == null) {
      _showErrorSnackBar('Please select a date');
      return;
    }
    if (_selectedTimeSlot == null) {
      _showErrorSnackBar('Please select a time slot');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.currentUser;

      if (user == null) {
        _showErrorSnackBar('Please login to book');
        setState(() => _isLoading = false);
        return;
      }

      final pricePerPerson = (widget.place['pricePerPerson'] ?? 5.0).toDouble();
      final totalAmount = pricePerPerson * _visitorCount;

      print('🚀 Starting booking process...');
      print('💰 Total amount: \$${totalAmount.toStringAsFixed(2)}');

      Map<String, dynamic> result;
      bool usedMockService = false; // No longer using mock service

      try {
        // Attempt to create booking with payment info
        result = await BookingService.createBooking(
          userId: user['_id'] ?? user['id'] ?? '',
          placeId: widget.place['_id'] ?? widget.place['id'] ?? '',
          bookingDate: _selectedDate!.toIso8601String(),
          numberOfPeople: _visitorCount,
          authToken: (user['token'] as String?) ?? '',
          userFullName: _nameController.text.trim(),
          userAccountNo: _phoneController.text.trim(),
          timeSlot: _selectedTimeSlot!,
        );

        print('📋 BookingService result: $result');

        // If booking service fails, try real payment service directly
        if (!result['success']) {
          print('BookingService failed, trying real payment service');
          print('Error: ${result['message']}');

          result = await PaymentService.createPayment(
            userId: user['_id'] ?? user['id'] ?? '',
            userFullName: _nameController.text.trim(),
            userAccountNo: _phoneController.text.trim(),
            placeId: widget.place['_id'] ?? widget.place['id'] ?? '',
            bookingDate: _selectedDate!.toIso8601String(),
            timeSlot: _selectedTimeSlot!,
            visitorCount: _visitorCount,
            placeName: widget.place['name_eng'] ??
                widget.place['name'] ??
                'Unknown Place',
            pricePerPerson: (widget.place['pricePerPerson'] ?? 5.0).toDouble(),
          );
          usedMockService = false; // This is real payment, not mock
        }
      } catch (e) {
        print('BookingService error, trying real payment service: $e');

        result = await PaymentService.createPayment(
          userId: user['_id'] ?? user['id'] ?? '',
          userFullName: _nameController.text.trim(),
          userAccountNo: _phoneController.text.trim(),
          placeId: widget.place['_id'] ?? widget.place['id'] ?? '',
          bookingDate: _selectedDate!.toIso8601String(),
          timeSlot: _selectedTimeSlot!,
          visitorCount: _visitorCount,
          placeName: widget.place['name_eng'] ??
              widget.place['name'] ??
              'Unknown Place',
          pricePerPerson: (widget.place['pricePerPerson'] ?? 5.0).toDouble(),
        );
        usedMockService = false; // This is real payment, not mock
      }

      if (result['success']) {
        // Check actual booking status from backend
        final bookingStatus = result['data']?['bookingStatus'];
        final actualPaidAmount =
            result['data']?['actualPaidAmount'] ?? totalAmount;

        if (mounted) {
          setState(() => _isLoading = false);
          Navigator.pop(context);

          if (bookingStatus == 'confirmed') {
            // Payment successful
            bool hasHormuudPayment = result['data']?['waafiResponse'] != null ||
                result['data']?['hormuudPayment'] == true;

            // Show success dialog with booking confirmation
            _showBookingSuccessDialog(
                result['data'], actualPaidAmount, false, hasHormuudPayment);
          } else {
            // Payment failed or cancelled
            final errorMessage =
                result['message'] ?? 'Payment was cancelled or failed';
            final errorType = result['data']?['paymentError']?['errorType'];

            // Show appropriate message based on error type
            String displayMessage = errorMessage;
            if (errorType == 'USER_CANCELLED') {
              displayMessage =
                  'Payment was cancelled. You can try again if needed.';
            }

            _showErrorSnackBar(displayMessage);
            setState(() => _isLoading = false);

            // Don't show the booking modal again for cancellations
            // The user can manually try booking again if they want
          }
        }
      } else {
        // Payment failed
        final errorMessage = result['message'] ?? 'Payment failed';
        _showErrorSnackBar(errorMessage);
        setState(() => _isLoading = false);
      }
    } catch (error) {
      print('Payment error: $error');
      _showErrorSnackBar('Network error. Please check your connection.');
      setState(() => _isLoading = false);
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: Duration(seconds: 3),
      ),
    );
  }

  void _showBookingSuccessDialog(
      Map<String, dynamic> bookingData, double totalAmount,
      [bool usedMockService = false, bool hasHormuudPayment = false]) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 60,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Booking Successful!',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Real payment processed successfully',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.green[700],
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildReceiptRow('Booking ID:', bookingData['_id'] ?? 'N/A'),
                  _buildReceiptRow('Place:', widget.place['name_eng']),
                  _buildReceiptRow('Date:',
                      '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'),
                  _buildReceiptRow('Time:', _selectedTimeSlot ?? ''),
                  _buildReceiptRow('Visitors:', _visitorCount.toString()),
                  _buildReceiptRow(
                      'Total Amount:', '\$${totalAmount.toStringAsFixed(2)}'),
                  _buildReceiptRow(
                      'Paid Amount:', '\$${totalAmount.toStringAsFixed(2)}',
                      isHighlight: true),
                  _buildReceiptRow('Status:', 'Confirmed', isHighlight: true),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(
                  builder: (context) => const DashboardScreen(initialIndex: 0),
                ),
                (route) => false,
              );
            },
            child: Text(
              'OK',
              style: GoogleFonts.poppins(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value,
      {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: isHighlight ? AppColors.primary : Colors.grey[600],
              fontWeight: isHighlight ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: isHighlight ? AppColors.primary : Colors.black,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final isEnglish = languageProvider.currentLanguage == 'en';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(isEnglish),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPlaceInfo(isEnglish),
                SizedBox(height: 20),
                _buildTabBar(),
                _buildTabContent(isEnglish),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildSliverAppBar(bool isEnglish) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      backgroundColor: AppColors.primary,
      leading: IconButton(
        icon: Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      actions: [
        IconButton(
          icon: Icon(
            _isFavorite ? Icons.favorite : Icons.favorite_border,
            color: _isFavorite ? Colors.red : Colors.white,
          ),
          onPressed: _toggleFavorite,
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            _buildImageCarousel(),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.7),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageCarousel() {
    final images = widget.place['images'] ?? [];
    if (images.isEmpty) {
      return Container(
        color: Colors.grey[300],
        child: Icon(Icons.image, size: 100, color: Colors.grey[600]),
      );
    }

    return PageView.builder(
      controller: _pageController,
      onPageChanged: (index) {
        setState(() {
          _currentImageIndex = index;
        });
      },
      itemCount: images.length,
      itemBuilder: (context, index) {
        return Image.network(
          images[index],
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              color: Colors.grey[300],
              child: Icon(Icons.image, size: 100, color: Colors.grey[600]),
            );
          },
        );
      },
    );
  }

  Widget _buildPlaceInfo(bool isEnglish) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isEnglish
                ? (widget.place['name_eng'] ??
                    widget.place['name'] ??
                    'Unknown Place')
                : (widget.place['name_som'] ??
                    widget.place['name'] ??
                    'Unknown Place'),
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.location_on, color: Colors.grey[600], size: 20),
              SizedBox(width: 4),
              Expanded(
                child: Text(
                  widget.place['location'] ?? 'Unknown Location',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          Row(
            children: [
              _buildInfoChip(
                Icons.attach_money,
                '\$${widget.place['pricePerPerson'] ?? 5.0} per person',
                AppColors.primary,
              ),
              SizedBox(width: 12),
              _buildInfoChip(
                Icons.people,
                'Max ${widget.place['maxCapacity'] ?? 20} people',
                Colors.blue,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          SizedBox(width: 4),
          Text(
            text,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(12),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.grey[600],
        labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        tabs: [
          Tab(text: 'About'),
          Tab(text: 'Gallery'),
          Tab(text: 'Reviews'),
        ],
      ),
    );
  }

  Widget _buildTabContent(bool isEnglish) {
    return Container(
      height: 300,
      margin: EdgeInsets.all(20),
      child: TabBarView(
        controller: _tabController,
        children: [
          _buildAboutTab(isEnglish),
          _buildGalleryTab(),
          _buildReviewsTab(),
        ],
      ),
    );
  }

  Widget _buildAboutTab(bool isEnglish) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Description',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 12),
          Text(
            isEnglish
                ? (widget.place['desc_eng'] ??
                    widget.place['description'] ??
                    'No description available')
                : (widget.place['desc_som'] ??
                    widget.place['description'] ??
                    'No description available'),
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.6,
            ),
          ),
          SizedBox(height: 20),
          Text(
            'Category',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 8),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              widget.place['category'] ?? 'General',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGalleryTab() {
    final images = widget.place['images'] ?? [];
    if (images.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image, size: 64, color: Colors.grey[400]),
            SizedBox(height: 16),
            Text(
              'No images available',
              style: GoogleFonts.poppins(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: images.length,
      itemBuilder: (context, index) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            images[index],
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                color: Colors.grey[300],
                child: Icon(Icons.image, color: Colors.grey[600]),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildReviewsTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.star, size: 64, color: Colors.grey[400]),
          SizedBox(height: 16),
          Text(
            'No reviews yet',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Be the first to review this place!',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    final pricePerPerson = (widget.place['pricePerPerson'] ?? 5.0).toDouble();

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'From \$${pricePerPerson.toStringAsFixed(2)} per person',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  Text(
                    'Book your visit now',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 16),
            ElevatedButton(
              onPressed: _showBookingModal,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Book Now',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
