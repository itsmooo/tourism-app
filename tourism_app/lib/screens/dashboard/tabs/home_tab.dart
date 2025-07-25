import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tourism_app/providers/language_provider.dart';
import 'package:tourism_app/providers/user_behavior_provider.dart';
import 'package:tourism_app/services/database_helper.dart';
import 'package:tourism_app/services/recommendation_service.dart';
import 'package:tourism_app/utils/app_colors.dart';
import 'package:tourism_app/widgets/modern_place_card.dart';
import 'package:tourism_app/widgets/language_toggle.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import 'package:tourism_app/utils/database_seeder.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({Key? key}) : super(key: key);

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> with TickerProviderStateMixin {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<Map<String, dynamic>> _places = [];
  List<Map<String, dynamic>> _filteredPlaces = [];
  String _selectedCategory = 'all';
  bool _isLoading = true;
  String? _recommendedCategory;
  List<Map<String, dynamic>> _recommendedPlaces = [];
  bool _isRecommending = false;
  double _scrollOffset = 0.0;

  late AnimationController _animationController;
  late AnimationController _heroAnimationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;
  late Animation<double> _heroParallaxAnimation;

  @override
  void initState() {
    super.initState();
    _loadPlaces();
    _loadLastRecommendation();
    _maybeRecommend();
    _setupAnimations();
    _setupScrollListener();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _heroAnimationController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _slideAnimation = Tween<double>(begin: 50.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );

    _heroParallaxAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
          parent: _heroAnimationController, curve: Curves.easeInOut),
    );

    _animationController.forward();
    _heroAnimationController.repeat(reverse: true);
  }

  void _setupScrollListener() {
    _scrollController.addListener(() {
      setState(() {
        _scrollOffset = _scrollController.offset;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _animationController.dispose();
    _heroAnimationController.dispose();
    super.dispose();
  }

  Future<void> _loadPlaces() async {
    setState(() => _isLoading = true);
    try {
      final places = await _dbHelper.getAllPlaces();
      setState(() {
        _places = places;
        _filteredPlaces = places;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadLastRecommendation() async {
    final prefs = await SharedPreferences.getInstance();
    final lastCategory = prefs.getString('last_recommended_category');
    if (lastCategory != null) {
      final dbHelper = DatabaseHelper();
      final places = await dbHelper.getPlacesByCategory(lastCategory);
      setState(() {
        _recommendedCategory = lastCategory;
        _recommendedPlaces = places;
      });
    }
  }

  void _maybeRecommend() async {
    if (_isRecommending) return;
    setState(() => _isRecommending = true);
    final behavior = Provider.of<UserBehaviorProvider>(context, listen: false);
    final recommendedCategory = await RecommendationService()
        .getRecommendedCategory(behavior.featureVector);
    if (recommendedCategory != null &&
        recommendedCategory != _recommendedCategory) {
      final dbHelper = DatabaseHelper();
      final places = await dbHelper.getPlacesByCategory(recommendedCategory);
      setState(() {
        _recommendedCategory = recommendedCategory;
        _recommendedPlaces = places;
      });
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_recommended_category', recommendedCategory);
    }
    setState(() => _isRecommending = false);
  }

  void _onSearchChanged(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredPlaces = _places;
      } else {
        _filteredPlaces = _places.where((place) {
          final name = place['name_eng']?.toLowerCase() ?? '';
          final desc = place['desc_eng']?.toLowerCase() ?? '';
          return name.contains(query.toLowerCase()) ||
              desc.contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);

    return Consumer<UserBehaviorProvider>(
      builder: (context, behavior, child) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _maybeRecommend();
        });

        return AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, _slideAnimation.value),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppColors.primary.withOpacity(0.05),
                        Colors.white,
                        AppColors.primary.withOpacity(0.02),
                      ],
                    ),
                  ),
                  child: CustomScrollView(
                    controller: _scrollController,
                    slivers: [
                      // Enhanced Hero Banner with Parallax
                      SliverToBoxAdapter(
                        child: _buildEnhancedHeroBanner(languageProvider),
                      ),

                      // Quick Stats Cards
                      SliverToBoxAdapter(
                        child: _buildQuickStatsCards(),
                      ),

                      // Modern Search Bar
                      SliverToBoxAdapter(
                        child: _buildModernSearchBar(languageProvider),
                      ),

                      // Enhanced Category Chips
                      SliverToBoxAdapter(
                        child: _buildEnhancedCategoryChips(languageProvider),
                      ),

                      // Recommended Section
                      if (_recommendedCategory != null &&
                          _recommendedPlaces.isNotEmpty)
                        _buildRecommendedSection(languageProvider),

                      // Trending Places Section
                      _buildTrendingSection(languageProvider),

                      // All Places Section
                      _buildAllPlacesSection(languageProvider),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildRecommendedSection(LanguageProvider languageProvider) {
    return SliverToBoxAdapter(
      child: Column(
        children: [
          _buildSectionHeader('Recommended for You', Icons.recommend),
          SizedBox(
            height: 340, // Increased height to accommodate the new card design
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _recommendedPlaces.length,
              itemBuilder: (context, index) {
                final place = _recommendedPlaces[index];
                return Container(
                  margin: const EdgeInsets.only(right: 16),
                  child: ModernPlaceCard(
                    place: place,
                    onFavoriteChanged: _loadPlaces,
                    modern: true,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendingSection(LanguageProvider languageProvider) {
    final trendingPlaces = _places.take(5).toList();

    return SliverToBoxAdapter(
      child: Column(
        children: [
          _buildSectionHeader('Trending Now', Icons.trending_up),
          SizedBox(
            height: 350, // Increased height to accommodate the new card design
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: trendingPlaces.length,
              itemBuilder: (context, index) {
                final place = trendingPlaces[index];
                return Container(
                  margin: const EdgeInsets.only(right: 16),
                  child: ModernPlaceCard(
                    place: place,
                    onFavoriteChanged: _loadPlaces,
                    modern: true,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllPlacesSection(LanguageProvider languageProvider) {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          if (index == 0) {
            return _buildSectionHeader('All Places', Icons.explore);
          }

          if (_isLoading) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(50),
                child: CircularProgressIndicator(),
              ),
            );
          }

          if (_filteredPlaces.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(50),
                child: Column(
                  children: [
                    Icon(
                      Icons.search_off,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      languageProvider.getText('no_places_found'),
                      style: GoogleFonts.poppins(
                        color: Colors.grey[600],
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final placeIndex = index - 1;
          if (placeIndex >= _filteredPlaces.length) return null;

          final place = _filteredPlaces[placeIndex];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ModernPlaceCard(
              place: place,
              onFavoriteChanged: _loadPlaces,
              modern: true,
            ),
          );
        },
        childCount: _isLoading
            ? 2
            : (_filteredPlaces.isEmpty ? 2 : _filteredPlaces.length + 1),
      ),
    );
  }

  Widget _buildEnhancedHeroBanner(LanguageProvider languageProvider) {
    return Container(
      height: 280,
      child: Stack(
        children: [
          // Parallax Background
          AnimatedBuilder(
            animation: _heroAnimationController,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(0,
                    -_scrollOffset * 0.5 + _heroParallaxAnimation.value * 10),
                child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(40),
                      bottomRight: Radius.circular(40),
                    ),
                    image: const DecorationImage(
                      image: AssetImage('assets/places/liido.jpg'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              );
            },
          ),

          // Gradient Overlay
          Container(
            height: 280,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(40),
                bottomRight: Radius.circular(40),
              ),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.4),
                  Colors.black.withOpacity(0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),

          // Content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.location_on,
                                    color: Colors.white, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  'Somalia',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const LanguageToggle(
                        showLabel: false,
                        iconColor: Colors.white,
                      ),
                    ],
                  ),

                  const Spacer(),

                  // Welcome Text
                  Text(
                    languageProvider.getText('welcome'),
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          blurRadius: 10,
                          color: Colors.black.withOpacity(0.5),
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    languageProvider.getText('explore_somalia'),
                    style: GoogleFonts.poppins(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                    ),
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStatsCards() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              icon: Icons.place,
              title: 'Places',
              value: '${_places.length}',
              color: Colors.blue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              icon: Icons.favorite,
              title: 'Favorites',
              value: '12',
              color: Colors.red,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              icon: Icons.star,
              title: 'Rating',
              value: '4.8',
              color: Colors.orange,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernSearchBar(LanguageProvider languageProvider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(25),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: languageProvider.getText('search'),
            hintStyle: GoogleFonts.poppins(color: Colors.grey[500]),
            prefixIcon: Container(
              padding: const EdgeInsets.all(12),
              child: Icon(Icons.search, color: AppColors.primary),
            ),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: Icon(Icons.clear, color: Colors.grey[500]),
                    onPressed: () {
                      _searchController.clear();
                      _onSearchChanged('');
                    },
                  )
                : null,
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 16),
          ),
          style: GoogleFonts.poppins(),
          onChanged: _onSearchChanged,
        ),
      ),
    );
  }

  Widget _buildEnhancedCategoryChips(LanguageProvider languageProvider) {
    final categories = [
      {'key': 'all', 'icon': Icons.public},
      {'key': 'beach', 'icon': Icons.beach_access},
      {'key': 'historical', 'icon': Icons.account_balance},
      {'key': 'cultural', 'icon': Icons.palette},
      {'key': 'religious', 'icon': Icons.mosque},
    ];

    return Container(
      height: 75,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: _buildEnhancedCategoryChip(
              category['key'] as String,
              languageProvider,
              category['icon'] as IconData,
            ),
          );
        },
      ),
    );
  }

  Widget _buildEnhancedCategoryChip(
      String category, LanguageProvider languageProvider, IconData icon) {
    final isSelected = _selectedCategory == category;
    final categoryText = languageProvider.getText(category);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      child: FilterChip(
        selected: isSelected,
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : AppColors.primary,
            ),
            const SizedBox(width: 6),
            Text(
              categoryText,
              style: GoogleFonts.poppins(
                color: isSelected ? Colors.white : AppColors.primary,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
        onSelected: (selected) {
          setState(() {
            _selectedCategory = selected ? category : 'all';
            _onSearchChanged(_searchController.text);
          });
        },
        backgroundColor: Colors.white,
        selectedColor: AppColors.primary,
        checkmarkColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(25),
        ),
        elevation: isSelected ? 8 : 2,
        shadowColor: isSelected
            ? AppColors.primary.withOpacity(0.3)
            : Colors.black.withOpacity(0.1),
        showCheckmark: false,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[800],
            ),
          ),
          const Spacer(),
          TextButton(
            onPressed: () {},
            child: Text(
              'See All',
              style: GoogleFonts.poppins(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
