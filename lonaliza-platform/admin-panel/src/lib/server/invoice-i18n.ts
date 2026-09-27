export type InvoiceLang = "ar" | "en" | "tr" | "fr";

export type InvoiceTranslations = {
  documentTitle: string;
  documentSubtitle: string;
  invoiceNumber: string;
  issuedAt: string;
  pnr: string;
  eTicket: string;
  status: string;
  statusPaid: string;
  statusPending: string;
  statusRefunded: string;
  companyInfo: {
    tursab: string;
    iata: string;
    taxOffice: string;
    phone: string;
    email: string;
    address: string;
  };
  customerSection: {
    title: string;
    name: string;
    email: string;
    phone: string;
  };
  serviceSection: {
    title: string;
    flightDetails: string;
    hotelDetails: string;
    airline: string;
    flightNumber: string;
    route: string;
    dates: string;
    cabinClass: string;
    roomType: string;
    nights: string;
    passengersOrGuests: string;
    seatOrRoom: string;
  };
  pricingSection: {
    title: string;
    baseFare: string;
    taxesAndFees: string;
    discount: string;
    netTotal: string;
    paymentMethod: string;
    paymentMethodCard: string;
    paymentMethodWallet: string;
    paymentMethodUsdt: string;
  };
  qrSection: {
    title: string;
    description: string;
    verifiedBadge: string;
    scanPrompt: string;
    viewOnline: string;
  };
  legalFooter: {
    sealText: string;
    termsTitle: string;
    terms1: string;
    terms2: string;
    terms3: string;
    disclaimer: string;
  };
  downloadPdf: string;
  printDocument: string;
};

export const INVOICE_TRANSLATIONS: Record<InvoiceLang, InvoiceTranslations> = {
  ar: {
    documentTitle: "فاتورة ضريبية رسمية (TAX INVOICE)",
    documentSubtitle: "وثيقة مالية رسمية معتمدة وموثقة إلكترونياً",
    invoiceNumber: "رقم الفاتورة",
    issuedAt: "تاريخ الإصدار",
    pnr: "رمز الحجز (PNR)",
    eTicket: "رقم التذكرة الإلكترونية",
    status: "حالة الدفع",
    statusPaid: "مسدد ومؤكد رسمياً",
    statusPending: "قيد المعالجة",
    statusRefunded: "مسترد",
    companyInfo: {
      tursab: "ترخيص TÜRSAB رقم: 14892",
      iata: "وكالة IATA المعتمدة: 42-2 9821",
      taxOffice: "الرقم الضريبي: 6090871234 (Beyoğlu V.D.)",
      phone: "+90 501 570 92 01",
      email: "support@lonaliza.com",
      address: "إسطنبول، الجمهورية التركية",
    },
    customerSection: {
      title: "بيانات العميل (CUSTOMER DETAILS)",
      name: "اسم العميل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف / الواتساب",
    },
    serviceSection: {
      title: "تفاصيل الخدمة المحجوزة",
      flightDetails: "تذكرة طيران مؤكدة",
      hotelDetails: "حجز إقامة فندقية مؤكد",
      airline: "شركة الطيران",
      flightNumber: "رقم الرحلة",
      route: "المسار ومحطات السفر",
      dates: "التواريخ والمواعيد",
      cabinClass: "درجة السفر",
      roomType: "نوع الغرفة والباقة",
      nights: "عدد الليالي",
      passengersOrGuests: "المسافر / النزيل",
      seatOrRoom: "المقعد / الغرفة",
    },
    pricingSection: {
      title: "البيان المالي والتكلفة التفصيلية",
      baseFare: "السعر الأساسي للخدمة",
      taxesAndFees: "الضرائب والرسوم الحكومية والخدمة",
      discount: "خصم الكوبون المعتمد",
      netTotal: "المبلغ الإجمالي المسدد",
      paymentMethod: "طريقة السداد",
      paymentMethodCard: "بطاقة مصرفية إلكترونية",
      paymentMethodWallet: "المحفظة الإلكترونية",
      paymentMethodUsdt: "العملات الرقمية (USDT)",
    },
    qrSection: {
      title: "كود التحقق الرقمي الرسمي المشفر",
      description: "امسح الكود بكاميرا أي هاتف ذكي للتحقق الفوري من صحة الفاتورة دون الحاجة لتسجيل الدخول.",
      verifiedBadge: "وثيقة موثقة رسمياً · SEAL OF AUTHENTICITY",
      scanPrompt: "مسح فوري بالكاميرا",
      viewOnline: "عرض الفاتورة الموثقة أونلاين",
    },
    legalFooter: {
      sealText: "هذه الفاتورة وثيقة إلكترونية رسمية صادرة ومعتمدة وتخضع للوائح TÜRSAB و IATA.",
      termsTitle: "الشروط والأحكام العامة:",
      terms1: "تخضع تذاكر الطيران والقسائم الفندقية لقوانين الطيران المدني الدولي وسياسات المزودين المعتمدين.",
      terms2: "في حال الرغبة في التعديل أو الاسترجاع، تسري شروط الفئة السعرية الخاصة بالحجز.",
      terms3: "يجب التواجد في المطار قبل 3 ساعات من موعد الإقلاع للرحلات الدولية.",
      disclaimer: "جميع الحقوق محفوظة © شركة لوناليزا للسياحة والسفر المحدودة.",
    },
    downloadPdf: "تنزيل الفاتورة كـ PDF فوري",
    printDocument: "طباعة الفاتورة",
  },
  en: {
    documentTitle: "OFFICIAL TAX INVOICE",
    documentSubtitle: "Officially Certified & Digitally Signed Electronic Document",
    invoiceNumber: "Invoice Number",
    issuedAt: "Issue Date",
    pnr: "Booking Reference (PNR)",
    eTicket: "E-Ticket Number",
    status: "Payment Status",
    statusPaid: "Paid & Confirmed",
    statusPending: "Pending Processing",
    statusRefunded: "Refunded",
    companyInfo: {
      tursab: "TÜRSAB License No: 14892",
      iata: "IATA Certified Agency: 42-2 9821",
      taxOffice: "Tax ID: 6090871234 (Beyoğlu V.D.)",
      phone: "+90 501 570 92 01",
      email: "support@lonaliza.com",
      address: "Istanbul, Republic of Turkey",
    },
    customerSection: {
      title: "CUSTOMER DETAILS",
      name: "Customer Name",
      email: "Email Address",
      phone: "Phone / WhatsApp",
    },
    serviceSection: {
      title: "BOOKED SERVICE DETAILS",
      flightDetails: "Confirmed Flight Ticket",
      hotelDetails: "Confirmed Hotel Voucher",
      airline: "Airline",
      flightNumber: "Flight Number",
      route: "Flight Route / Itinerary",
      dates: "Dates & Schedule",
      cabinClass: "Cabin Class",
      roomType: "Room Type & Board",
      nights: "Nights",
      passengersOrGuests: "Passenger / Guest",
      seatOrRoom: "Seat / Room",
    },
    pricingSection: {
      title: "FINANCIAL BREAKDOWN & CHARGES",
      baseFare: "Base Service Fare",
      taxesAndFees: "Taxes & Governmental Surcharges",
      discount: "Applied Coupon Discount",
      netTotal: "Total Amount Paid",
      paymentMethod: "Payment Method",
      paymentMethodCard: "Electronic Credit/Debit Card",
      paymentMethodWallet: "Digital Wallet",
      paymentMethodUsdt: "Cryptocurrency (USDT)",
    },
    qrSection: {
      title: "Cryptographic Verification QR Code",
      description: "Scan this code with any smartphone camera to verify this invoice instantly without logging in.",
      verifiedBadge: "VERIFIED AUTHENTIC DOCUMENT · SEAL OF AUTHENTICITY",
      scanPrompt: "Scan with Camera",
      viewOnline: "View Verified Invoice Online",
    },
    legalFooter: {
      sealText: "This invoice is an official electronic document issued and regulated under TÜRSAB and IATA standards.",
      termsTitle: "Terms & Conditions:",
      terms1: "Flight tickets and hotel vouchers are subject to international civil aviation rules and supplier policies.",
      terms2: "Cancellation and date modification requests are subject to the fare rules of the booking.",
      terms3: "Passengers are required to be at the airport at least 3 hours prior to international departure.",
      disclaimer: "All rights reserved © Lonaliza Tourism & Travel LLC.",
    },
    downloadPdf: "Download PDF Invoice",
    printDocument: "Print Document",
  },
  tr: {
    documentTitle: "RESMİ VERGİ FATURASI (TAX INVOICE)",
    documentSubtitle: "Resmi Olarak Onaylanmış ve Dijital Olarak İmzalanmış Elektronik Belge",
    invoiceNumber: "Fatura Numarası",
    issuedAt: "Düzenleme Tarihi",
    pnr: "Rezervasyon Kodu (PNR)",
    eTicket: "Elektronik Bilet No",
    status: "Ödeme Durumu",
    statusPaid: "Ödendi ve Onaylandı",
    statusPending: "İşlem Bekliyor",
    statusRefunded: "İade Edildi",
    companyInfo: {
      tursab: "TÜRSAB Belge No: 14892",
      iata: "IATA Yetkili Acente: 42-2 9821",
      taxOffice: "VKN: 6090871234 (Beyoğlu V.D.)",
      phone: "+90 501 570 92 01",
      email: "support@lonaliza.com",
      address: "İstanbul, Türkiye Cumhuriyeti",
    },
    customerSection: {
      title: "MÜŞTERİ BİLGİLERİ",
      name: "Müşteri Adı",
      email: "E-posta Adresi",
      phone: "Telefon / WhatsApp",
    },
    serviceSection: {
      title: "REZERVASYON VE HİZMET DETAYLARI",
      flightDetails: "Onaylı Uçak Bileti",
      hotelDetails: "Onaylı Otel Rezervasyonu",
      airline: "Havayolu",
      flightNumber: "Uçuş Numarası",
      route: "Güzergah ve Parkur",
      dates: "Tarih ve Saatler",
      cabinClass: "Uçuş Sınıfı",
      roomType: "Oda Tipi ve Pansiyon",
      nights: "Gece Sayısı",
      passengersOrGuests: "Yolcu / Misafir",
      seatOrRoom: "Koltuk / Oda",
    },
    pricingSection: {
      title: "FİYATLANDIRMA VE ÜCRET DÖKÜMÜ",
      baseFare: "Temel Hizmet Bedeli",
      taxesAndFees: "Vergiler ve Harçlar",
      discount: "Kupon İndirimi",
      netTotal: "Toplam Ödenen Tutar",
      paymentMethod: "Ödeme Yöntemi",
      paymentMethodCard: "Kredi / Banka Kartı",
      paymentMethodWallet: "Cüzdan Bakiyesi",
      paymentMethodUsdt: "Kripto (USDT)",
    },
    qrSection: {
      title: "Kriptografik Doğrulama QR Kodu",
      description: "Bu faturanın orijinalliğini giriş yapmadan doğrulamak için kodu akıllı telefon kameranızla tarayın.",
      verifiedBadge: "RESMİ ONAYLI BELGE · SEAL OF AUTHENTICITY",
      scanPrompt: "Kamera ile Tara",
      viewOnline: "Doğrulanmış Faturayı Görüntüle",
    },
    legalFooter: {
      sealText: "Bu fatura resmi bir elektronik belgedir ve TÜRSAB ile IATA standartlarına tabidir.",
      termsTitle: "Genel Şartlar ve Kurallar:",
      terms1: "Uçak biletleri ve otel kuponları uluslararası sivil havacılık ve tedarikçi kurallarına tabidir.",
      terms2: "İptal ve değişiklik talepleri bilet sınıfı ve rezervasyon koşullarına göre değerlendirilir.",
      terms3: "Dış hat uçuşlarında kalkış saatinden en az 3 saat önce havalimanında bulunulmalıdır.",
      disclaimer: "Tüm hakları saklıdır © Lonaliza Turizm ve Seyahat Ltd. Şti.",
    },
    downloadPdf: "PDF Faturayı İndir",
    printDocument: "Faturayı Yazdır",
  },
  fr: {
    documentTitle: "FACTURE OFFICIELLE DE TAXE",
    documentSubtitle: "Document Électronique Certifié et Signé Numériquement",
    invoiceNumber: "Numéro de Facture",
    issuedAt: "Date d'Émission",
    pnr: "Référence de Réservation (PNR)",
    eTicket: "Numéro de Billet Électronique",
    status: "Statut du Paiement",
    statusPaid: "Payé et Confirmé",
    statusPending: "En Cours",
    statusRefunded: "Remboursé",
    companyInfo: {
      tursab: "Licence TÜRSAB N°: 14892",
      iata: "Agence IATA Certifiée: 42-2 9821",
      taxOffice: "N° Fiscal: 6090871234 (Beyoğlu V.D.)",
      phone: "+90 501 570 92 01",
      email: "support@lonaliza.com",
      address: "Istanbul, République de Turquie",
    },
    customerSection: {
      title: "DÉTAILS DU CLIENT",
      name: "Nom du Client",
      email: "Adresse Email",
      phone: "Téléphone / WhatsApp",
    },
    serviceSection: {
      title: "DÉTAILS DU SERVICE RÉSERVÉ",
      flightDetails: "Billet d'Avion Confirmé",
      hotelDetails: "Bon d'Hôtel Confirmé",
      airline: "Compagnie Aérienne",
      flightNumber: "Numéro de Vol",
      route: "Itinéraire de Vol",
      dates: "Dates et Horaires",
      cabinClass: "Classe de Cabine",
      roomType: "Type de Chambre",
      nights: "Nuits",
      passengersOrGuests: "Passager / Client",
      seatOrRoom: "Siège / Chambre",
    },
    pricingSection: {
      title: "VENTILATION FINANCIÈRE ET FRAIS",
      baseFare: "Tarif de Base du Service",
      taxesAndFees: "Taxes et Frais Gouvernementaux",
      discount: "Remise Coupon Appliquée",
      netTotal: "Montant Total Payé",
      paymentMethod: "Mode de Paiement",
      paymentMethodCard: "Carte Bancaire Électronique",
      paymentMethodWallet: "Portefeuille Virtuel",
      paymentMethodUsdt: "Cryptomonnaie (USDT)",
    },
    qrSection: {
      title: "Code QR de Vérification Cryptographique",
      description: "Scannez ce code avec un smartphone pour vérifier cette facture instantanément sans connexion.",
      verifiedBadge: "DOCUMENT OFFICIEL CERTIFIÉ · SEAL OF AUTHENTICITY",
      scanPrompt: "Scanner avec Caméra",
      viewOnline: "Voir la Facture Vérifiée en Ligne",
    },
    legalFooter: {
      sealText: "Cette facture est un document électronique officiel régi par les règlements TÜRSAB et IATA.",
      termsTitle: "Conditions Générales:",
      terms1: "Les billets d'avion et les réservations d'hôtel sont soumis aux règles de l'aviation civile internationale.",
      terms2: "Les demandes de modification et d'annulation dépendent des conditions tarifaires de la réservation.",
      terms3: "Les passagers doivent se présenter à l'aéroport 3 heures avant le départ international.",
      disclaimer: "Tous droits réservés © Lonaliza Tourisme & Voyage SARL.",
    },
    downloadPdf: "Télécharger la Facture PDF",
    printDocument: "Imprimer le Document",
  },
};

export function getInvoiceTranslations(lang?: string): { t: InvoiceTranslations; lang: InvoiceLang; dir: "rtl" | "ltr" } {
  const clean = (lang || "ar").toLowerCase().slice(0, 2);
  const activeLang: InvoiceLang = clean === "en" ? "en" : clean === "tr" ? "tr" : clean === "fr" ? "fr" : "ar";
  return {
    t: INVOICE_TRANSLATIONS[activeLang],
    lang: activeLang,
    dir: activeLang === "ar" ? "rtl" : "ltr",
  };
}
