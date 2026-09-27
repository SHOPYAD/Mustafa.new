import 'package:flutter/material.dart';

import '../my_cards_theme.dart';

class MyCardsAddCardButton extends StatelessWidget {
  const MyCardsAddCardButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: FilledButton(
          onPressed: onPressed,
          style: FilledButton.styleFrom(
            backgroundColor: MyCardsTheme.blue,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.8),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.add, size: 16, color: Colors.white),
              ),
              const SizedBox(width: 10),
              Text('Add Card', style: MyCardsTheme.addCardBtn),
            ],
          ),
        ),
      ),
    );
  }
}
