import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// "Select coverage package" — None vs Superior comparison (Trip-style).
class CarRentalCoveragePackagesTable extends StatefulWidget {
  const CarRentalCoveragePackagesTable({super.key});

  @override
  State<CarRentalCoveragePackagesTable> createState() => _CarRentalCoveragePackagesTableState();
}

class _CarRentalCoveragePackagesTableState extends State<CarRentalCoveragePackagesTable> {
  /// 0 = None (included), 1 = Superior add-on
  int _selected = 0;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select coverage package', style: CarRentalProductTheme.sectionTitle),
          const SizedBox(height: 14),
          Table(
            columnWidths: const {
              0: FlexColumnWidth(2.1),
              1: FlexColumnWidth(1.35),
              2: FlexColumnWidth(1.35),
            },
            defaultVerticalAlignment: TableCellVerticalAlignment.middle,
            children: [
              TableRow(
                children: [
                  const Padding(
                    padding: EdgeInsets.only(bottom: 8),
                    child: Text(
                      'Optional packages (2)',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: CarRentalProductTheme.metaGrey),
                    ),
                  ),
                  _PackageHeaderCell(
                    label: 'None',
                    barsFilled: 1,
                    selected: _selected == 0,
                    onTap: () => setState(() => _selected = 0),
                  ),
                  _PackageHeaderCell(
                    label: 'Superior',
                    barsFilled: 5,
                    selected: _selected == 1,
                    onTap: () => setState(() => _selected = 1),
                  ),
                ],
              ),
              _dashRow(),
              _featureRow(
                'Loss Damage Waiver',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: const Text(
                  'Excess \$0',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: CarRentalProductTheme.tealPositive,
                  ),
                ),
              ),
              _dashRow(),
              _featureRow(
                'Glass and tires',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: Icon(Icons.check_rounded, color: CarRentalProductTheme.tealPositive, size: 20),
              ),
              _dashRow(),
              _featureRow(
                'Chassis and car lights',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: Icon(Icons.check_rounded, color: CarRentalProductTheme.tealPositive, size: 20),
              ),
              _dashRow(),
              _featureRow(
                'Roadside Assistance',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: Icon(Icons.check_rounded, color: CarRentalProductTheme.tealPositive, size: 20),
              ),
              _dashRow(),
              _featureRow(
                'Non-operation Charge Waiver',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: Icon(Icons.check_rounded, color: CarRentalProductTheme.tealPositive, size: 20),
              ),
              _dashRow(),
              _featureRow(
                'Administration fee waiver',
                noneChild: const Icon(Icons.close_rounded, color: Color(0xFFDC2626), size: 20),
                superiorChild: Icon(Icons.check_rounded, color: CarRentalProductTheme.tealPositive, size: 20),
              ),
              _dashRow(),
              TableRow(
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Text('Price', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Text(
                      '+\$0/day',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Text(
                      '+\$20/day',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
              _dashRow(),
              TableRow(
                children: [
                  const SizedBox.shrink(),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8, top: 4),
                    child: Text(
                      _selected == 0 ? 'Currently included' : '',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: CarRentalProductTheme.metaGrey),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8, top: 4),
                    child: Center(
                      child: FilledButton(
                        onPressed: () => setState(() => _selected = 1),
                        style: FilledButton.styleFrom(
                          backgroundColor: CarRentalProductTheme.primaryBlue,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Select', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  TableRow _dashRow() {
    return TableRow(
      children: List.generate(
        3,
        (_) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade300),
        ),
      ),
    );
  }

  TableRow _featureRow(String label, {required Widget noneChild, required Widget superiorChild}) {
    return TableRow(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, height: 1.3),
          ),
        ),
        Center(child: noneChild),
        Center(child: superiorChild),
      ],
    );
  }
}

class _PackageHeaderCell extends StatelessWidget {
  const _PackageHeaderCell({
    required this.label,
    required this.barsFilled,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int barsFilled;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.fromLTRB(8, 10, 8, 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? CarRentalProductTheme.primaryBlue : const Color(0xFFE5E7EB),
              width: selected ? 2 : 1,
            ),
            gradient: selected
                ? const LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0xFFEFF6FF), Color(0xFFF8FAFC)],
                  )
                : null,
            color: selected ? null : Colors.white,
          ),
          child: Column(
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: selected ? CarRentalProductTheme.primaryBlue : CarRentalProductTheme.titleDark,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final on = i < barsFilled;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 1.5),
                    width: 6,
                    height: 10,
                    decoration: BoxDecoration(
                      color: on ? CarRentalProductTheme.tealPositive : const Color(0xFFE5E7EB),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 6),
              const Text(
                'Details >',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: CarRentalProductTheme.primaryBlue,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
