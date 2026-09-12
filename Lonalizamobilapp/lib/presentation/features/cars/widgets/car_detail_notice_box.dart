import 'package:flutter/material.dart';

import '../car_detail_theme.dart';

class CarDetailNoticeBox extends StatelessWidget {
  const CarDetailNoticeBox({
    super.key,
    required this.text,
  });

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: CarDetailTheme.noticeBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: CarDetailTheme.accordionBody.copyWith(fontSize: 13, color: CarDetailTheme.metaGrey),
      ),
    );
  }
}
