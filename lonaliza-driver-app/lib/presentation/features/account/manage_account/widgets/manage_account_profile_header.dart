import 'package:flutter/material.dart';

import '../manage_account_theme.dart';
import '../../account_theme.dart';

/// Gradient strip + large avatar + edit control (Account Security reference).
class ManageAccountProfileHeader extends StatelessWidget {
  const ManageAccountProfileHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 8, bottom: 28),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            ManageAccountTheme.headerGradientTop,
            ManageAccountTheme.headerGradientBottom,
          ],
        ),
      ),
      child: Center(
        child: SizedBox(
          width: 92,
          height: 92,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              CircleAvatar(
                radius: 44,
                backgroundColor: AccountTheme.primaryBlue,
                child: Icon(Icons.person_rounded, size: 52, color: Colors.white.withValues(alpha: 0.95)),
              ),
              Positioned(
                right: -2,
                bottom: -2,
                child: Material(
                  color: AccountTheme.primaryBlue,
                  shape: const CircleBorder(),
                  elevation: 2,
                  shadowColor: Colors.black26,
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () {},
                    child: const Padding(
                      padding: EdgeInsets.all(7),
                      child: Icon(Icons.edit_outlined, size: 15, color: Colors.white),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
