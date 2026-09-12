import 'package:flutter/material.dart';

import '../../../../core/auth/auth_error_mapper.dart';

class EmailAuthCredentials {
  const EmailAuthCredentials({
    required this.email,
    required this.password,
    required this.name,
    required this.register,
  });

  final String email;
  final String password;
  final String name;
  final bool register;
}

class EmailAuthSheet extends StatefulWidget {
  const EmailAuthSheet({super.key, this.onSubmit});

  final Future<void> Function(EmailAuthCredentials credentials)? onSubmit;

  static Future<void> show(
    BuildContext context, {
    Future<void> Function(EmailAuthCredentials credentials)? onSubmit,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => EmailAuthSheet(onSubmit: onSubmit),
    );
  }

  @override
  State<EmailAuthSheet> createState() => _EmailAuthSheetState();
}

class _EmailAuthSheetState extends State<EmailAuthSheet> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  bool _register = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final onSubmit = widget.onSubmit;
    if (onSubmit == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    if (_password.text.trim().length < 8) {
      setState(() {
        _busy = false;
        _error = AuthErrorMapper.shortPassword;
      });
      return;
    }
    try {
      await onSubmit(
        EmailAuthCredentials(
          email: _email.text.trim(),
          password: _password.text,
          name: _name.text.trim(),
          register: _register,
        ),
      );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = AuthErrorMapper.map(
            e,
            password: _password.text,
            register: _register,
          );
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
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
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 16, 16, 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: InkWell(
                  onTap: () => Navigator.of(context).maybePop(),
                  child: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(Icons.arrow_back, size: 24, color: Color(0xFF1F2937)),
                  ),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      _register ? 'Create an account' : 'Sign in',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Use the same Lonaliza email and password as the website.',
                      style: TextStyle(fontSize: 15, color: Color(0xFF374151), height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    if (_register) ...[
                      _field(_name, 'Name', TextInputType.name),
                      const SizedBox(height: 12),
                    ],
                    _field(_email, 'Email', TextInputType.emailAddress),
                    const SizedBox(height: 12),
                    _field(_password, 'Password', TextInputType.visiblePassword, obscure: true),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C))),
                    ],
                    TextButton(
                      onPressed: _busy ? null : () => setState(() => _register = !_register),
                      child: Text(_register ? 'I already have an account' : 'Create an account'),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: _busy ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  elevation: 0,
                ),
                child: Text(
                  _busy ? 'Please wait…' : (_register ? 'Create account' : 'Sign in'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                ),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom + 16),
          ],
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String hint,
    TextInputType type, {
    bool obscure = false,
  }) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFD1D5DB)),
        borderRadius: BorderRadius.circular(6),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(fontSize: 16, color: Color(0xFF9CA3AF)),
          border: InputBorder.none,
        ),
        keyboardType: type,
        style: const TextStyle(fontSize: 16, color: Color(0xFF1F2937)),
      ),
    );
  }
}
