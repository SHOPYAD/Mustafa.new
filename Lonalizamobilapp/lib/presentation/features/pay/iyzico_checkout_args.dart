class IyzicoCheckoutArgs {
  const IyzicoCheckoutArgs({required this.bookingId, this.title = 'Payment'});

  final String bookingId;
  final String title;
}
