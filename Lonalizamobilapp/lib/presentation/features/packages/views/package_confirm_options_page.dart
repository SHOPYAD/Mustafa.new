import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/package_confirm_bottom_bar.dart';
import '../widgets/package_confirm_hotel_card.dart';
import '../widgets/package_confirm_itinerary_card.dart';
import '../widgets/package_confirm_vehicle_card.dart';

class PackageConfirmOptionsPage extends StatefulWidget {
  const PackageConfirmOptionsPage({super.key});

  @override
  State<PackageConfirmOptionsPage> createState() => _PackageConfirmOptionsPageState();
}

class _PackageConfirmOptionsPageState extends State<PackageConfirmOptionsPage> {
  int _tabIndex = 0; // 0 = Hotel, 1 = Itinerary
  int _selectedVehicle = 0;

  static const _tabs = ['Hotel', 'Itinerary'];

  static const _vehicles = [
    _VehicleData(
      label: 'Comfort (5 seats)',
      seats: 5,
      passengers: 4,
      luggage: 2,
      model: 'Hongqi H5/Volkswagen Passat B5',
      extraPrice: '+\$0',
    ),
    _VehicleData(
      label: 'Medium van (7 seats)',
      seats: 7,
      passengers: 6,
      luggage: 4,
      model: 'Buick GL8',
      extraPrice: '+\$98.38',
      perPersonNote: 'Per person +\$50',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: Stack(
        children: [
          NestedScrollView(
            headerSliverBuilder: (context, _) => [
              SliverAppBar(
                backgroundColor: Colors.white,
                elevation: 0,
                pinned: true,
                leading: GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back_rounded, color: Color(0xFF111827)),
                ),
                title: const Text('Confirm options',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                actions: [
                  // Passenger count pill
                  Container(
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.person_outline_rounded, size: 14, color: Color(0xFF374151)),
                        Text(' 2', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        SizedBox(width: 6),
                        Icon(Icons.child_care_rounded, size: 14, color: Color(0xFF374151)),
                        Text(' 0', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        SizedBox(width: 4),
                        Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Color(0xFF374151)),
                      ],
                    ),
                  ),
                ],
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(49),
                  child: _ConfirmTabBar(
                    tabs: _tabs,
                    selectedIndex: _tabIndex,
                    onChanged: (i) => setState(() => _tabIndex = i),
                  ),
                ),
              ),
            ],
            body: SingleChildScrollView(
              child: IndexedStack(
                index: _tabIndex,
                children: [
                  // ── Tab 0: Hotel
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),

                      // Itinerary summary card
                      const PackageConfirmItineraryCard(
                        departure: 'Wednesday, Apr 29',
                        returnDate: 'Wednesday, May 6',
                        nights: 7,
                        days: 8,
                      ),

                      // Travelers row
                      _InfoRow(
                        label: 'Travelers',
                        value: '2 adults, 0 children  ›',
                        onTap: () {},
                      ),

                      const SizedBox(height: 8),

                      // Service Guarantee
                      Container(
                        color: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        child: Row(
                          children: const [
                            Icon(Icons.verified_rounded, size: 16, color: Color(0xFF10B981)),
                            SizedBox(width: 6),
                            Text('Service Guarantee  ',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF10B981))),
                            Text('Departure guaranteed',
                                style: TextStyle(fontSize: 13, color: Color(0xFF374151))),
                          ],
                        ),
                      ),

                      // ── Hotel section header
                      _SectionHeader(icon: Icons.hotel_rounded, label: 'Hotel'),

                      // Beijing hotel
                      PackageConfirmHotelCard(
                        checkIn: 'Apr 29',
                        nights: 3,
                        checkOut: 'May 2',
                        city: 'Beijing',
                        imagePath: 'assets/images/1.jpg',
                        hotelName: 'Beijing New World Centre Tongpai Hotel ›',
                        highlights: const ['Easy to get around', 'Close to metro'],
                        location: 'Near Tiananmen Square | Qianmen, The Temple Of Heaven and Chongwenmen',
                        rating: 4.5,
                        ratingCount: '5',
                        roomType: 'Superior King Room',
                        bedType: '1 queen bed · 32m²',
                        cancellationPolicy: 'No meals included · Free cancellation before 12:00 AM, Apr 28 (local time)',
                        promoText: 'Enjoy a 40% discount on hotel restaurant bills during your stay (excluding special offers). (1 per day)',
                      ),

                      const SizedBox(height: 10),
                      _ChangeHotelButton(onTap: () {}),

                      const SizedBox(height: 16),

                      // Xi'an hotel
                      PackageConfirmHotelCard(
                        checkIn: 'May 2',
                        nights: 2,
                        checkOut: 'May 4',
                        city: "Xi'an",
                        imagePath: 'assets/images/2.jpg',
                        hotelName: "Novotel Xi'an Daming Palace ›",
                        highlights: const ['Easy to get around', 'Friendly front desk staff'],
                        location: 'Near Longshouyuan | Beiguan/Longshou District',
                        rating: 4.8,
                        ratingCount: '5',
                        roomType: 'Superior Queen Room',
                        bedType: '1 queen bed · 30m²',
                        cancellationPolicy: 'No meals included · Free cancellation before 11:00 PM, May 1 (local time)',
                        warningText: 'A max. of 3 rooms',
                      ),

                      const SizedBox(height: 10),
                      _ChangeHotelButton(onTap: () {}),

                      const SizedBox(height: 16),

                      // Shanghai hotel
                      PackageConfirmHotelCard(
                        checkIn: 'May 4',
                        nights: 2,
                        checkOut: 'May 6',
                        city: 'Shanghai',
                        imagePath: 'assets/images/3.jpg',
                        hotelName: 'Mercure Shanghai Yu Garden On the Bund ›',
                        highlights: const ['Delicious breakfast'],
                        location: 'Near Yu Garden | Bund, Old Town District',
                        rating: 4.6,
                        ratingCount: '5',
                        roomType: 'Superior Double Room',
                        bedType: '1 double bed · 28m²',
                        cancellationPolicy: 'Breakfast included · Free cancellation before 12:00 PM, May 3 (local time)',
                        warningText: 'A max. of 3 rooms',
                      ),

                      const SizedBox(height: 10),
                      _ChangeHotelButton(onTap: () {}),

                      const SizedBox(height: 16),

                      // ── Itineraries section
                      _SectionHeader(icon: Icons.luggage_rounded, label: 'Itineraries'),
                      Container(
                        color: Colors.white,
                        margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                        padding: const EdgeInsets.all(16),
                        child: const Text('8-day package',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                      ),

                      const SizedBox(height: 16),

                      // ── Vehicle options section
                      _SectionHeader(icon: Icons.directions_car_rounded, label: 'Vehicle options'),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          children: _vehicles.asMap().entries.map((e) {
                            return Expanded(
                              child: Padding(
                                padding: EdgeInsets.only(right: e.key < _vehicles.length - 1 ? 10 : 0),
                                child: PackageConfirmVehicleCard(
                                  label: e.value.label,
                                  seats: e.value.seats,
                                  passengers: e.value.passengers,
                                  luggage: e.value.luggage,
                                  model: e.value.model,
                                  extraPrice: e.value.extraPrice,
                                  isSelected: _selectedVehicle == e.key,
                                  onTap: () => setState(() => _selectedVehicle = e.key),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),

                      // Bottom spacing for bottom bar
                      const SizedBox(height: 150),
                    ],
                  ),

                  // ── Tab 1: Itinerary
                  const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text(
                      'Day-by-day itinerary details will appear here.',
                      style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Fixed bottom bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: PackageConfirmBottomBar(
              totalPrice: r'$3,710.91',
              discount: '-\$124.14',
              tripCoins: '\$7.43',
              onNext: () => context.push('/packages/booking'),
              onSupport: () {},
            ),
          ),
        ],
      ),
    );
  }
}

// ── Tab bar at the top
class _ConfirmTabBar extends StatelessWidget {
  const _ConfirmTabBar({required this.tabs, required this.selectedIndex, required this.onChanged});
  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: tabs.asMap().entries.map((e) {
            final selected = e.key == selectedIndex;
            return Expanded(
              child: GestureDetector(
                onTap: () => onChanged(e.key),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  color: Colors.white,
                  child: Text(
                    e.value,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: selected ? const Color(0xFF7C3AED) : const Color(0xFF6B7280),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        Row(
          children: tabs.asMap().entries.map((e) {
            return Expanded(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 2,
                color: e.key == selectedIndex ? const Color(0xFF7C3AED) : const Color(0xFFF3F4F6),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ── Section header (icon + label)
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
      margin: const EdgeInsets.only(bottom: 0),
      child: Row(
        children: [
          Icon(icon, size: 18, color: const Color(0xFF374151)),
          const SizedBox(width: 8),
          Text(label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
        ],
      ),
    );
  }
}

// ── Simple info row (Travelers, etc.)
class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value, this.onTap});
  final String label;
  final String value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF374151))),
            Text(value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
          ],
        ),
      ),
    );
  }
}

// ── "Change hotel" outlined button
class _ChangeHotelButton extends StatelessWidget {
  const _ChangeHotelButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: double.infinity,
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFD1D5DB)),
          ),
          alignment: Alignment.center,
          child: const Text('Change hotel',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF7C3AED))),
        ),
      ),
    );
  }
}

// ── Vehicle data model
class _VehicleData {
  const _VehicleData({
    required this.label,
    required this.seats,
    required this.passengers,
    required this.luggage,
    required this.model,
    required this.extraPrice,
    this.perPersonNote,
  });
  final String label;
  final int seats;
  final int passengers;
  final int luggage;
  final String model;
  final String extraPrice;
  final String? perPersonNote;
}
