import 'package:flutter/material.dart';

class EmailAuthSheet extends StatelessWidget {
  const EmailAuthSheet({super.key, this.onContinue});

  final VoidCallback? onContinue;

  static void show(BuildContext context, {VoidCallback? onContinue}) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => EmailAuthSheet(onContinue: onContinue),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 16, 16, 16),
              child: Stack(
                alignment: Alignment.centerLeft,
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).maybePop(),
                    child: const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Icon(Icons.arrow_back, size: 24, color: Color(0xFF1F2937)),
                    ),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Sign in or Create an Account',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      "We'll use this to sign you in or create an account for you if you don't have one yet",
                      style: TextStyle(
                        fontSize: 15,
                        color: Color(0xFF374151),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Email Input Field
                    Container(
                      height: 56,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFD1D5DB)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          const Icon(Icons.email_outlined, color: Color(0xFF1F2937), size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              decoration: const InputDecoration(
                                hintText: 'Email',
                                hintStyle: TextStyle(fontSize: 16, color: Color(0xFF9CA3AF)),
                                border: InputBorder.none,
                              ),
                              keyboardType: TextInputType.emailAddress,
                              style: const TextStyle(fontSize: 16, color: Color(0xFF1F2937)),
                              autofocus: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Bottom Button
            Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  onContinue?.call();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2F60F5),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  elevation: 0,
                ),
                child: const Text('Continue', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom + 16),
          ],
        ),
      ),
    );
  }
}
