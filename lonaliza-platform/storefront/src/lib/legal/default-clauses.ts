import type { LegalCustomClause } from "@/types/legal-settings";

export const DEFAULT_LEGAL_CLAUSES: LegalCustomClause[] = [
  // ==========================================
  // TERMS OF SERVICE (10 OFFICIAL CLAUSES)
  // ==========================================
  {
    id: "terms_clause_1",
    targetDoc: "terms",
    sectionKey: "sec-role",
    titleAr: "1. صفة الوسيط التجاري ونطاق الخدمة (Intermediary Status)",
    titleEn: "1. Agency Intermediary Role & Scope of Service",
    titleTr: "1. Ticari Aracı Konumu ve Hizmet Kapsamı",
    titleFr: "1. Statut d'intermédiaire commercial et portée du service",
    contentAr:
      "تعتبر شركتنا وسيطاً إلكترونياً معتمداً (Online Travel Agency - OTA) يوفر للمسافرين إمكانية البحث والمقارنة وحجز تذاكر الطيران، الفنادق، الجولات السياحية، وتأجير السيارات من خلال الربط المباشر مع شبكات التوزيع العالمية (GDS) مثل Amadeus وSabre وموزعي الفنادق وشركات الطيران. ينعقد عقد النقل أو الإقامة مباشرة بين العميل ومزود الخدمة المعني.",
    contentEn:
      "Our company operates as an accredited Online Travel Agency (OTA) facilitating search, comparison, and booking for flights, hotels, tours, and car rentals via direct integration with Global Distribution Systems (GDS) and direct travel suppliers. The actual carriage or accommodation contract is concluded directly between the customer and the respective provider.",
    contentTr:
      "Şirketimiz, Amadeus ve Sabre gibi Küresel Dağıtım Sistemleri (GDS) ve otel sağlayıcıları ile doğrudan entegrasyon aracılığıyla uçak bileti, otel, tur ve araç kiralama rezervasyonları sağlayan yetkili bir Çevrimiçi Seyahat Acentasıdır (OTA). Taşıma veya konaklama sözleşmesi doğrudan müşteri ile ilgili sağlayıcı arasında kurulur.",
    contentFr:
      "Notre société opère en qualité d'agence de voyage en ligne accréditée (OTA) facilitant la recherche, la comparaison et la réservation de billets d'avion, d'hôtels et de circuits touristiques via les systèmes mondiaux de distribution (GDS). Le contrat de transport ou d'hébergement est conclu directement entre le client et le prestataire concerné.",
    badge: "صفة الوسيط",
    order: 10,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_2",
    targetDoc: "terms",
    sectionKey: "sec-flights",
    titleAr: "2. قواعد تذاكر الطيران وسياسات شركات الطيران (Flight Ticketing Rules)",
    titleEn: "2. Flight Ticketing Rules & Airline Carriage Policies",
    titleTr: "2. Uçak Bileti Kuralları ve Havayolu Politikaları",
    titleFr: "2. Règles de billetterie aérienne et politiques des compagnies",
    contentAr:
      "بمجرد تأكيد الدفع وإصدار رمز الحجز (PNR) ورقم التذكرة الإلكترونية (E-Ticket)، تصبح التذكرة رسمية ومرتبطة بسجل الناقل الجوي. يجب إدخال اسم المسافر مطابقاً تماماً لجواز السفر ساري المفعول، حيث تمنع لوائح الآياتا (IATA) وشركات الطيران تعديل الاسم كلياً بعد الإصدار. كما تختلف أوزان الأمتعة وسياسات الإلغاء بحسب الفئة السعرية الصادرة.",
    contentEn:
      "Once payment is confirmed and the PNR record and E-Ticket number are issued, the ticket is officially associated with the carrier's inventory. Passenger names must match official passports exactly; IATA regulations strictly prohibit complete name changes post-ticketing. Baggage allowances and cancellation rules depend on the purchased fare brand.",
    contentTr:
      "Ödeme onaylanıp PNR ve E-Bilet numarası oluşturulduktan sonra bilet resmiyet kazanır. Yolcu isimleri pasaportla birebir uyuşmalıdır; IATA kuralları gereği bilet kesildikten sonra isim değişikliği yapılamaz. Bagaj hakları ve iptal şartları seçilen bilet sınıfına bağlıdır.",
    contentFr:
      "Dès confirmation du paiement et émission du PNR et du billet électronique (E-Ticket), le titre de transport devient officiel. Le nom du passager doit correspondre strictement au passeport en vigueur; la réglementation IATA interdit tout changement de nom après émission. Les franchises de bagages varient selon la classe tarifaire.",
    badge: "قواعد الطيران",
    order: 20,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_3",
    targetDoc: "terms",
    sectionKey: "sec-protection",
    titleAr: "3. خدمة حماية التذاكر الذكية والاسترداد 90% (Smart Protection Policy)",
    titleEn: "3. Smart Ticket Protection & 90% Refund Policy",
    titleTr: "3. Akıllı Bilet Güvencesi ve %90 İade Politikası",
    titleFr: "3. Protection intelligente des billets et remboursement à 90%",
    contentAr:
      "تتيح ميزة الحماية الذكية للعميل الذي اختار هذه الترقية إمكانية إلغاء حجز الطيران غير المسترد واسترداد ما يصل إلى 90% من القيمة الإجمالية للتذكرة وفق الشروط المحددة في وثيقة الضمان، شريطة تقديم طلب الإلغاء قبل موعد إقلاع الرحلة بـ 24 ساعة على الأقل عبر صفحة الحجز بلوحة العميل.",
    contentEn:
      "The Smart Protection upgrade allows travelers to cancel non-refundable flight bookings and receive up to a 90% refund under the program terms, provided the cancellation is lodged via the customer portal at least 24 hours prior to scheduled flight departure.",
    contentTr:
      "Akıllı Güvence seçeneğini tercih eden yolcular, iadesiz biletlerini uçuş saatinden en az 24 saat önce iptal ederek bilet bedelinin %90'ına kadar olan kısmını güvence şartları kapsamında iade alabilirler.",
    contentFr:
      "L'option Protection Intelligente permet aux passagers d'annuler un billet non remboursable et de récupérer jusqu'à 90% de son montant selon les conditions du contrat, sous réserve d'une demande soumise au moins 24h avant le départ prévu.",
    badge: "حماية ذكية 90%",
    order: 30,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_4",
    targetDoc: "terms",
    sectionKey: "sec-hotels",
    titleAr: "4. حجوزات الفنادق والمنتجعات وتصنيف الغرف (Hotel Bookings)",
    titleEn: "4. Hotel & Resort Reservations and Room Policies",
    titleTr: "4. Otel ve Tesis Rezervasyonları ile Oda Kuralları",
    titleFr: "4. Réservations d'hôtels, complexes et politiques de chambres",
    contentAr:
      "تخضع حجوزات الفنادق لسياسات تسجيل الوصول (Check-in) والمغادرة (Check-out) المعتمدة لدى المنشأة الفندقية، وعادة ما يكون الدخول من الساعة 14:00 والمغادرة حتى الساعة 12:00 ظهراً. يتم تحديد سياسة الإلغاء المجاني أو غير المسترد بوضوح في فوشر الحجز المعتمد قبل الدفع.",
    contentEn:
      "Hotel reservations are subject to each property's standard check-in (typically 14:00) and check-out (typically 12:00) schedules. Free cancellation deadlines and non-refundable terms are explicitly displayed on the booking voucher prior to payment.",
    contentTr:
      "Otel rezervasyonları tesisin standart giriş (14:00) ve çıkış (12:00) saatlerine tabidir. Ücretsiz iptal tarihleri ve iadesiz koşullar rezervasyon kuponunda açıkça belirtilmektedir.",
    contentFr:
      "Les réservations d'hôtel sont assujetties aux horaires d'arrivée (14h00) et de départ (12h00) de l'établissement. Les délais d'annulation gratuite et conditions non remboursables sont précisés sur le bon d'échange.",
    badge: "الفنادق والإقامة",
    order: 40,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_5",
    targetDoc: "terms",
    sectionKey: "sec-transfers",
    titleAr: "5. خدمات النقل والجولات وتأجير السيارات (Transfers & Tours)",
    titleEn: "5. Private Transfers, Guided Tours & Car Rentals",
    titleTr: "5. Özel Transferler, Turlar ve Araç Kiralama",
    titleFr: "5. Transferts privés, excursions et location de voitures",
    contentAr:
      "تشمل خدمات الاستقبال والتوصيل انتظار السائق في صالة الوصول مع لوحة الاسم لفترة أقصاها 60 دقيقة من وقت هبوط الرحلة الفعلي. في تأجير السيارات، يجب تقديم بطاقة ائتمانية باسم السائق الرئيسي ورخصة قيادة دولية أو محلية معتمدة وفق اشتراطات الدولة المضيفة.",
    contentEn:
      "Airport transfer services include complimentary driver waiting in the arrivals hall with a name sign for up to 60 minutes after actual flight touch-down. For car rentals, a credit card in the primary driver's name and valid driving license are mandatory.",
    contentTr:
      "Havalimanı transfer hizmetlerinde şoför, uçağın iniş saatinden itibaren 60 dakikaya kadar isim tabelasıyla bekleme yapar. Araç kiralamada ana sürücü adına kredi kartı ve geçerli sürücü belgesi zorunludur.",
    contentFr:
      "Les transferts aéroport incluent un accueil avec panneau nominatif jusqu'à 60 minutes après l'atterrissage effectif. Pour la location de véhicule, une carte de crédit au nom du conducteur principal et un permis valide sont obligatoires.",
    badge: "المواصلات والجولات",
    order: 50,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_6",
    targetDoc: "terms",
    sectionKey: "sec-changes",
    titleAr: "6. سياسات التعديل، الإلغاء، ورسوم الخدمة (Cancellations & Fees)",
    titleEn: "6. Post-Booking Changes, Cancellations & Service Fees",
    titleTr: "6. Rezervasyon Değişiklikleri, İptaller ve Hizmet Bedelleri",
    titleFr: "6. Modifications, annulations et frais de service",
    contentAr:
      "تخضع طلبات تعديل مواعيد السفر أو الإلغاء للشروط السعرية للناقل أو الفندق، مضافاً إليها رسوم خدمة إدارية رمزية لإعادة الإصدار. تتم معالجة المبالغ المستردة تلقائياً عبر نفس وسيلة الدفع الأصلية أو كمحفظة إلكترونية فورية بناءً على اختيار العميل.",
    contentEn:
      "Ticket changes and cancellation requests are subject to supplier fare rules plus a nominal administrative processing fee. Approved refunds are credited back to the original payment method or instantly issued as travel wallet credit upon customer request.",
    contentTr:
      "Değişiklik ve iptal talepleri tedarikçinin tarife kurallarına ve işlem ücretine tabidir. Onaylanan iadeler orijinal ödeme yöntemine aktarılır veya müşteri tercihine göre anında cüzdana yüklenir.",
    contentFr:
      "Les demandes de modification et d'annulation dépendent des règles tarifaires du fournisseur, majorées de frais administratifs. Les remboursements sont effectués sur le mode de paiement d'origine ou crédités sur le portefeuille client.",
    badge: "الإلغاء والاسترجاع",
    order: 60,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_7",
    targetDoc: "terms",
    sectionKey: "sec-payments",
    titleAr: "7. الأسعار، الضرائب، وبوابات الدفع وUSDT (Payments & Pricing)",
    titleEn: "7. Pricing, Statutory Taxes & Payment Gateways (Cards & USDT)",
    titleTr: "7. Fiyatlandırma, Vergiler ve Ödeme Yöntemleri (Kart & Kripto)",
    titleFr: "7. Tarification, taxes et modes de paiement (Cartes et cryptomonnaies)",
    contentAr:
      "تشمل كافة الأسعار المعروضة على المنصة الضرائب الحكومية والرسوم الإلزامية المعمول بها. نقبل الدفع الآمن بالبطاقات الائتمانية عبر بروتوكول 3D-Secure المشفر، بالإضافة إلى دعم الدفع بالعملات الرقمية الثابتة (Binance Pay USDT) والتحويلات البنكية المباشرة.",
    contentEn:
      "All prices quoted on the platform include applicable statutory taxes and airport departure fees. We accept secure 3D-Secure card payments, Binance Pay (USDT stablecoin), and direct verified bank wire transfers.",
    contentTr:
      "Platformdaki tüm fiyatlar yasal vergileri ve havalimanı harçlarını kapsar. 3D-Secure korumalı kredi kartları, Binance Pay (USDT) ve doğrudan banka havalesi ile güvenli ödeme kabul edilmektedir.",
    contentFr:
      "Tous les prix affichés comprennent les taxes et redevances aéroportuaires obligatoires. Nous acceptons les cartes bancaires sécurisées 3D-Secure, Binance Pay (USDT) et les virements bancaires certifiés.",
    badge: "المدفوعات والضرائب",
    order: 70,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_8",
    targetDoc: "terms",
    sectionKey: "sec-traveler",
    titleAr: "8. التزامات المسافر والوثائق الرسمية والجوازات (Traveler Obligations)",
    titleEn: "8. Traveler Documentation, Passports & Visa Responsibilities",
    titleTr: "8. Yolcu Yükümlülükleri, Pasaport ve Vize Sorumlulukları",
    titleFr: "8. Obligations du voyageur, passeports et visas",
    contentAr:
      "يتحمل المسافر المسؤولية الكاملة عن التأكد من سريان مفعول جواز السفر (6 أشهر على الأقل) والحصول على تأشيرات الدخول والترانزيت والشهادات الصحية المطلوبة لبلد الوجهة. لا تتحمل المنصة أي مسؤولية عن رفض صعود المسافر للطائرة من قبل سلطات الهجرة والحدود.",
    contentEn:
      "Travelers bear sole responsibility for passport validity (minimum 6 months from travel date), acquiring visas, transit permits, and requisite health certificates. The agency assumes no liability for boarding denials imposed by border control authorities.",
    contentTr:
      "Yolcular, pasaport geçerlilik süresini (en az 6 ay), vize, transit vize ve sağlık gereksinimlerini temin etmekle bizzat yükümlüdür. Göçmenlik otoritelerince uçağa biniş reddi durumunda acente sorumluluk kabul etmez.",
    contentFr:
      "Le voyageur est seul responsable de la validité de son passeport (minimum 6 mois), de l'obtention des visas et formalités sanitaires. L'agence décline toute responsabilité en cas de refus d'embarquement par les autorités frontalières.",
    badge: "مسؤوليات المسافر",
    order: 80,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_9",
    targetDoc: "terms",
    sectionKey: "sec-liability",
    titleAr: "9. حدود المسؤولية والظروف القاهرة (Limitation of Liability)",
    titleEn: "9. Limitation of Liability & Force Majeure Events",
    titleTr: "9. Sorumluluğun Sınırlandırılması ve Mücbir Sebepler",
    titleFr: "9. Limitation de responsabilité et force majeure",
    contentAr:
      "لا تتحمل المنصة المسؤولية عن التأخير أو الإلغاء الناجم عن ظروف قاهرة خارجة عن السيطرة، بما في ذلك الأحوال الجوية الطارئة، الكوارث الطبيعية، الإضرابات العامة، أو إغلاق الأجواء السيادية. ينحصر الحد الأقصى للمسؤولية المالية في حدود قيمة رسوم الخدمة المستلمة.",
    contentEn:
      "The agency is not liable for flight delays, cancellations, or damages resulting from force majeure events (severe weather, natural disasters, union strikes, sovereign airspace closures). Total liability is strictly limited to the service fees earned.",
    contentTr:
      "Acente, olağanüstü hava muhalefeti, grevler veya hava sahası kapanması gibi mücbir sebeplerden doğan gecikme ve iptallerden sorumlu tutulamaz. Acentenin azami mali sorumluluğu alınan hizmet komisyonu ile sınırlıdır.",
    contentFr:
      "L'agence ne peut être tenue responsable des retards ou annulations dus à des cas de force majeure (intempéries, conflits armés, fermeture de l'espace aérien). Notre responsabilité maximale est plafonnée aux frais de service perçus.",
    badge: "حدود المسؤولية",
    order: 90,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "terms_clause_10",
    targetDoc: "terms",
    sectionKey: "sec-legal",
    titleAr: "10. القانون الحاكم وتسوية النزاعات والتواصل (Governing Law & Disputes)",
    titleEn: "10. Governing Law, Dispute Resolution & Official Jurisdiction",
    titleTr: "10. Uygulanacak Hukuk, Uyuşmazlık Çözümü ve Yetkili Mahkemeler",
    titleFr: "10. Droit applicable, règlement des litiges et juridiction",
    contentAr:
      "تخضع هذه الاتفاقية للقوانين والأنظمة التجارية المعتمدة في دولة مقر الشركة المرخصة ولائحة حماية المستهلك الدولية. تختص المحاكم وهيئات التحكيم التجاري المحددة في بيانات الشركة الرسمية بالنظر في أي نزاع ينشأ عن تفسير أو تنفيذ هذا العقد.",
    contentEn:
      "These Terms are governed by and construed in accordance with the commercial and consumer protection laws of the company's registration jurisdiction. The commercial courts designated in the corporate identity section hold exclusive jurisdiction over disputes.",
    contentTr:
      "Bu sözleşme şirketin yasal merkezinin bulunduğu ülke mevzuatına tabidir. Sözleşmenin ifasından doğabilecek her türlü uyuşmazlıkta şirket profilinde belirtilen Tüketici Hakem Heyetleri ve Merkez Mahkemeleri yetkilidir.",
    contentFr:
      "Les présentes conditions sont régies par la législation du siège social de l'entreprise. En cas de litige, les tribunaux de commerce désignés dans la fiche légale de la société sont exclusivement compétents.",
    badge: "القانون والاختصاص",
    order: 100,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },

  // ==========================================
  // PRIVACY POLICY (9 OFFICIAL CLAUSES)
  // ==========================================
  {
    id: "privacy_clause_1",
    targetDoc: "privacy",
    sectionKey: "sec-controller",
    titleAr: "1. هوية مسؤول معالجة البيانات والترخيص (Data Controller Identity)",
    titleEn: "1. Identity of the Data Controller & Legal Registration",
    titleTr: "1. Veri Sorumlusunun Kimliği ve Yasal Tescil",
    titleFr: "1. Identité du responsable du traitement et immatriculation",
    contentAr:
      "تعتبر شركتنا المسجلة رسمياً بالجهات التجارية والمعتمدة بترخيص السياحة المعني هي 'المسؤول عن معالجة البيانات' (Data Controller) بموجب قوانين حماية البيانات الشخصية المعمول بها واللائحة الأوروبية العامة لحماية البيانات (GDPR). نتعهد بحماية بياناتكم وفق أرفع المعايير الدولية.",
    contentEn:
      "Our officially registered travel enterprise acts as the designated Data Controller under applicable statutory privacy legislation and EU GDPR Article 4. We are committed to safeguarding personal data in accordance with rigorous global standards.",
    contentTr:
      "Tescilli seyahat işletmemiz, yürürlükteki Kişisel Verilerin Korunması Kanunu (KVKK) ve AB Genel Veri Koruma Tüzüğü (GDPR) Madde 4 uyarınca Veri Sorumlusudur. Kişisel verilerinizi en yüksek uluslararası standartlarda korumayı taahhüt ederiz.",
    contentFr:
      "Notre entreprise de voyages immatriculée agit en qualité de Responsable du traitement au sens du RGPD européen et des lois applicables. Nous nous engageons à sécuriser vos informations selon les normes internationales les plus exigeantes.",
    badge: "مسؤول المعالجة",
    order: 10,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_2",
    targetDoc: "privacy",
    sectionKey: "sec-data",
    titleAr: "2. فئات البيانات الشخصية المجمعة (Categories of Personal Data)",
    titleEn: "2. Categories of Personal Data Collected",
    titleTr: "2. Toplanan Kişisel Veri Kategorileri",
    titleFr: "2. Catégories de données personnelles collectées",
    contentAr:
      "نقوم بجمع البيانات الضرورية لإصدار التذاكر وقسائم الفنادق: الاسم الكامل، تاريخ الميلاد، الجنس، رقم جواز السفر وتاريخ انتهائه، الجنسية، البريد الإلكتروني، رقم الهاتف، ومعلومات الدفع المشفرة المرمزة (Tokenized Payment Data).",
    contentEn:
      "We collect data strictly required to issue travel documents: full name, date of birth, gender, passport number and expiry date, nationality, contact email, phone number, and tokenized encrypted payment credentials.",
    contentTr:
      "Seyahat belgelerini düzenlemek için zorunlu olan verileri topluyoruz: ad-soyad, doğum tarihi, cinsiyet, pasaport numarası ve geçerlilik tarihi, uyruk, e-posta, telefon ve şifrelenmiş ödeme bilgileri.",
    contentFr:
      "Nous recueillons les données strictement nécessaires à l'émission des titres de voyage: nom complet, date de naissance, genre, numéro de passeport, nationalité, courriel, téléphone et données de paiement cryptées.",
    badge: "فئات البيانات",
    order: 20,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_3",
    targetDoc: "privacy",
    sectionKey: "sec-purpose",
    titleAr: "3. أهداف وسندات المعالجة القانونية (Processing Purposes & Legal Basis)",
    titleEn: "3. Processing Purposes & Legal Basis (GDPR Art. 6)",
    titleTr: "3. İşleme Amaçları ve Hukuki Dayanaklar",
    titleFr: "3. Finalités du traitement et bases légales",
    contentAr:
      "تتم معالجة بياناتكم الشخصية استناداً إلى ضرورة تنفيذ عقد السفر المبرم، والامتثال للالتزامات القانونية والضريبية، وتأمين سلامة الطيران وإجراءات الهجرة الدولية، وحماية المصالح المشروعة للمنصة في مكافحة الاحتيال المالي.",
    contentEn:
      "Personal data processing is grounded in contract performance (GDPR Art. 6(1)(b)), statutory tax and civil aviation compliance (Art. 6(1)(c)), and our legitimate interest in fraud prevention and platform transaction security.",
    contentTr:
      "Kişisel verileriniz, seyahat sözleşmesinin ifası, mali ve havacılık mevzuatına uyum, dolandırıcılığı önleme ve meşru menfaatlerimiz doğrultusunda hukuka uygun şekilde işlenmektedir.",
    contentFr:
      "Vos données sont traitées pour l'exécution du contrat de voyage (art. 6.1.b du RGPD), le respect des obligations légales fiscales et aéronautiques, et notre intérêt légitime dans la prévention de la fraude.",
    badge: "السند القانوني",
    order: 30,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_4",
    targetDoc: "privacy",
    sectionKey: "sec-sharing",
    titleAr: "4. مشاركة البيانات مع مزودي الطيران والـ GDS (Data Sharing)",
    titleEn: "4. Data Sharing with Airlines, Hotels & Global GDS Networks",
    titleTr: "4. Havayolları, Oteller ve GDS ile Veri Paylaşımı",
    titleFr: "4. Partage de données avec les compagnies aériennes et hôtels",
    contentAr:
      "نشارك بيانات المسافرين حصراً مع مزودي خدمات السفر الفعليين (شركات الطيران المشغلة، شبكات التوزيع العالمية Amadeus/Sabre، وسلاسل الفنادق المعتمدة) لإتمام تأكيد الحجز وإصدار التذاكر والفواتير الرسمية.",
    contentEn:
      "Passenger data is transmitted strictly to executing suppliers (operating carriers, Global Distribution Systems, and booked hotels) for the sole purpose of confirming itineraries and issuing verified vouchers.",
    contentTr:
      "Yolcu bilgileri, rezervasyonun kesinleşmesi ve biletin tanzimi amacıyla yalnızca hizmeti ifa eden havayolu şirketleri, Amadeus/Sabre sistemleri ve otel tedarikçileri ile paylaşılır.",
    contentFr:
      "Les données sont transmises exclusivement aux prestataires finaux (compagnies aériennes, réseaux GDS et hôtels réservés) afin de finaliser vos réservations et émettre les titres officiels.",
    badge: "مشاركة البيانات",
    order: 40,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_5",
    targetDoc: "privacy",
    sectionKey: "sec-transfer",
    titleAr: "5. النقل الدولي للبيانات عبر الحدود (Cross-Border Transfers)",
    titleEn: "5. International Cross-Border Data Transfers (GDPR Chapter V)",
    titleTr: "5. Sınır Ötesi Uluslararası Veri Aktarımı",
    titleFr: "5. Transferts internationaux de données hors UE",
    contentAr:
      "نظراً لطبيعة نشاط السفر الدولي، قد يتم نقل بيانات المسافرين إلى خوادم شركات طيران وفنادق تقع خارج بلد الإقامة بموجب المادة 49(1)(b) من الـ GDPR لكونه ضرورياً لتنفيذ عقد السفر، مع تطبيق البنود التعاقدية القياسية (SCCs).",
    contentEn:
      "Due to the global nature of air travel, passenger data may be transferred internationally pursuant to GDPR Article 49(1)(b) as strictly necessary for contract performance, supported by Standard Contractual Clauses (SCCs).",
    contentTr:
      "Uluslararası seyahatlerin doğası gereği, yolcu verileri sözleşmenin ifası için zorunlu olduğundan GDPR Madde 49(1)(b) uyarınca yurt dışındaki havayolu sunucularına güvenli biçimde aktarılmaktadır.",
    contentFr:
      "En raison du caractère international du voyage, les données peuvent être transférées hors de l'UE en vertu de l'article 49.1.b du RGPD, appuyées par les clauses contractuelles types de la Commission européenne.",
    badge: "نقل البيانات الدولي",
    order: 50,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_6",
    targetDoc: "privacy",
    sectionKey: "sec-security",
    titleAr: "6. حماية وأمن البيانات والتشفير (Security & Encryption)",
    titleEn: "6. Data Security Measures & End-to-End Encryption",
    titleTr: "6. Veri Güvenliği Önlemleri ve Uçtan Uca Şifreleme",
    titleFr: "6. Mesures de sécurité et chiffrement de bout en bout",
    contentAr:
      "نطبق معايير أمنية متطورة تشمل تشفير البيانات أثناء النقل (TLS 1.3) وعند التخزين (AES-256)، وجدران حماية نشطة للشبكات السحابية، وقيود صلاحيات الوصول الإداري متعددة العوامل (MFA)، والفحص الدوري للثغرات الأمنية.",
    contentEn:
      "We implement state-of-the-art technical security including TLS 1.3 in-transit and AES-256 at-rest encryption, cloud firewalls, multi-factor administrative authentication (MFA), and recurring vulnerability assessments.",
    contentTr:
      "Aktarım sırasında TLS 1.3 ve sunucularda AES-256 şifreleme, bulut güvenlik duvarları ve çok faktörlü kimlik doğrulama (MFA) dahil olmak üzere en ileri teknik güvenlik tedbirlerini uyguluyoruz.",
    contentFr:
      "Nous mettons en œuvre des mesures de sécurité de pointe: chiffrement TLS 1.3 en transit et AES-256 au repos, pare-feux cloud, authentification multifacteur (MFA) et audits réguliers de vulnérabilité.",
    badge: "الأمن والتشفير",
    order: 60,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_7",
    targetDoc: "privacy",
    sectionKey: "sec-rights",
    titleAr: "7. حقوق أصحاب البيانات والعملاء (Your Legal Rights)",
    titleEn: "7. User Data Subject Rights (Access, Rectification, Erasure)",
    titleTr: "7. Veri Sahibi Hakları (Erişim, Düzeltme, Silme)",
    titleFr: "7. Droits des utilisateurs (Accès, rectification, effacement)",
    contentAr:
      "يحق لك في أي وقت: الوصول لبياناتك والاطلاع على سجلاتها، تصحيح أي بيانات غير دقيقة، تصدير ملف كامل ببياناتك بصيغة JSON، وسحب الموافقة على الرسائل الترويجية، أو طلب حذف حسابك ومحو بياناتك نهائياً من خوادمنا.",
    contentEn:
      "You have statutory rights to access personal records, rectify inaccuracies, export machine-readable JSON files, withdraw consent for marketing, and request permanent erasure under GDPR Article 17.",
    contentTr:
      "Dilediğiniz an verilerinize erişme, yanlış bilgileri düzeltme, JSON formatında dışa aktarma, pazarlama onayını geri çekme veya hesabınızı kalıcı olarak sildirme hakkına sahipsiniz.",
    contentFr:
      "Vous disposez à tout moment d'un droit d'accès, de rectification, de portabilité des données sous format JSON, de retrait du consentement et d'effacement de votre compte conformément à l'article 17 du RGPD.",
    badge: "حقوق المستخدم",
    order: 70,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_8",
    targetDoc: "privacy",
    sectionKey: "sec-cookies",
    titleAr: "8. سياسة ملفات تعريف الارتباط والتحليلات (Cookies & Telemetry)",
    titleEn: "8. Cookies & Telemetry Policy",
    titleTr: "8. Çerezler ve Analitik Politikası",
    titleFr: "8. Politique des cookies et traceurs",
    contentAr:
      "نستخدم ملفات تعريف الارتباط الأساسية لتمكين تسجيل الدخول وحفظ تفضيلات العملة واللغة وحماية الجلسة. كما نستخدم ملفات تحليلية مجهولة الهوية لتحسين سرعة وأداء محركات البحث وحجز التذاكر.",
    contentEn:
      "We utilize essential session cookies for authentication, currency, and language preferences, alongside anonymized telemetry to optimize flight search algorithms and platform loading speed.",
    contentTr:
      "Oturum açma, dil ve para birimi tercihlerini kaydetmek için zorunlu çerezler ile arama motoru hızını ve performansını artırmak için anonim analitik çerezler kullanıyoruz.",
    contentFr:
      "Nous employons des cookies essentiels pour maintenir votre session, devise et préférences linguistiques, ainsi que des traceurs d'analyse anonymisés pour optimiser nos moteurs de recherche.",
    badge: "ملفات الكوكيز",
    order: 80,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "privacy_clause_9",
    targetDoc: "privacy",
    sectionKey: "sec-dpo",
    titleAr: "9. مكتب مسؤول حماية البيانات والتواصل (DPO Office)",
    titleEn: "9. Data Protection Officer (DPO) & Statutory Contact",
    titleTr: "9. Veri Koruma Görevlisi (DPO) ve İletişim",
    titleFr: "9. Délégué à la protection des données (DPO) et contact",
    contentAr:
      "إذا كان لديكم أي استفسار أو رغبة في ممارسة حقوقكم القانونية، يمكنكم التواصل مباشرة مع مكتب مسؤول حماية البيانات (DPO) عبر البريد الإلكتروني الرسمي أو الخط الساخن، ونلتزم بالرد والبت في الطلبات خلال مدة أقصاها 72 ساعة.",
    contentEn:
      "For privacy inquiries or to exercise your statutory rights, please contact our Data Protection Office directly via verified email or hotline. We commit to addressing and resolving inquiries within 72 business hours.",
    contentTr:
      "Gizlilik haklarınızı kullanmak veya bilgi almak için Veri Koruma Görevlimize (DPO) doğrudan ulaşabilirsiniz. Talepleriniz en geç 72 saat içinde yasal olarak sonuçlandırılır.",
    contentFr:
      "Pour toute question relative à vos données personnelles, veuillez contacter notre DPO par courriel officiel. Nous nous engageons à traiter vos demandes dans un délai légal de 72 heures.",
    badge: "مسؤول الخصوصية",
    order: 90,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },

  // ==========================================
  // GDPR & KVKK PORTAL (8 OFFICIAL CLAUSES)
  // ==========================================
  {
    id: "gdpr_clause_1",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-15",
    titleAr: "المادة 15: حق الوصول والاطلاع على البيانات (Right of Access)",
    titleEn: "Article 15: Right of Access by the Data Subject",
    titleTr: "Madde 15: İlgili Kişinin Erişim Hakkı",
    titleFr: "Article 15 : Droit d'accès de la personne concernée",
    contentAr:
      "يحق لك الحصول من المنصة على تأكيد بشأن ما إذا كانت بياناتك الشخصية يجري معالجتها، والاطلاع على تفاصيل أغراض المعالجة وفئات البيانات ومستلميها وفترة الاحتفاظ المتوقعة.",
    contentEn:
      "The data subject has the right to obtain confirmation as to whether personal data concerning them is being processed, and to access full disclosure regarding processing purposes and recipients.",
    contentTr:
      "İlgili kişi, kişisel verilerinin işlenip işlenmediğine dair teyit alma ve işleme amaçları ile alıcı gruplarına ilişkin tam bilgi edinme hakkına sahiptir.",
    contentFr:
      "La personne concernée a le droit d'obtenir la confirmation que des données la concernant sont ou ne sont pas traitées ainsi que l'accès auxdites données et finalités.",
    badge: "GDPR Art. 15",
    order: 10,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_2",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-16",
    titleAr: "المادة 16: حق التصحيح وتحديث البيانات (Right to Rectification)",
    titleEn: "Article 16: Right to Rectification of Inaccurate Data",
    titleTr: "Madde 16: Düzeltme Hakkı",
    titleFr: "Article 16 : Droit de rectification",
    contentAr:
      "يحق لك طلب تصحيح أي بيانات شخصية غير دقيقة تخصك دون تأخير غير مبرر، واستكمال أي بيانات غير مكتملة بما في ذلك تقديم إقرار تكميلي عبر لوحة الحساب.",
    contentEn:
      "The data subject has the statutory right to obtain without undue delay the rectification of inaccurate personal data, and to complete incomplete profiles.",
    contentTr:
      "İlgili kişi, kendisiyle ilgili yanlış verilerin gecikmeksizin düzeltilmesini ve eksik bilgilerin tamamlanmasını talep etme hakkına sahiptir.",
    contentFr:
      "La personne concernée a le droit d'obtenir du responsable du traitement, dans les meilleurs délais, la rectification des données à caractère personnel inexactes.",
    badge: "GDPR Art. 16",
    order: 20,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_3",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-17",
    titleAr: "المادة 17: الحق في محو البيانات والنسيان (Right to Erasure)",
    titleEn: "Article 17: Right to Erasure ('Right to be Forgotten')",
    titleTr: "Madde 17: Silme Hakkı ('Unutulma Hakkı')",
    titleFr: "Article 17 : Droit à l'effacement (« droit à l'oubli »)",
    contentAr:
      "يحق لك طلب مسح كافة بياناتك الشخصية وإلغاء حسابك نهائياً عند انتفاء الحاجة إليها أو عند سحب موافقتك، وتلتزم المنصة بتنفيذ المسح الكامل من كافة الخوادم وقواعد البيانات وجلسات المصادقة.",
    contentEn:
      "The data subject has the right to obtain the irreversible erasure of personal data without undue delay where data is no longer necessary or upon consent withdrawal.",
    contentTr:
      "Verilerin işlenme amacı ortadan kalktığında veya rıza geri çekildiğinde, ilgili kişi verilerinin tüm sunuculardan kalıcı olarak silinmesini talep edebilir.",
    contentFr:
      "La personne concernée a le droit d'obtenir l'effacement de données la concernant dans les meilleurs délais lorsque les données ne sont plus nécessaires.",
    badge: "GDPR Art. 17",
    order: 30,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_4",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-18",
    titleAr: "المادة 18: حق تقييد وتجميد المعالجة (Restriction of Processing)",
    titleEn: "Article 18: Right to Restriction of Data Processing",
    titleTr: "Madde 18: İşlemenin Kısıtlanması Hakkı",
    titleFr: "Article 18 : Droit à la limitation du traitement",
    contentAr:
      "يحق لك طلب تجميد أو تقييد معالجة بياناتك في حالات الطعن في دقتها لفترة تمكن المنصة من التحقق من صحتها، أو عندما تكون المعالجة غير قانونية وتفضل تقييدها بدلاً من مسحها.",
    contentEn:
      "You hold the right to obtain restriction of processing when contesting data accuracy or when processing is contested pending legal verification.",
    contentTr:
      "Veri doğruluğuna itiraz edildiğinde doğrulama süresince veya hukuka aykırılık iddialarında verilerin işlenmesinin sınırlandırılması talep edilebilir.",
    contentFr:
      "La personne concernée a le droit d'obtenir la limitation du traitement lorsque l'exactitude des données est contestée pendant la période de vérification.",
    badge: "GDPR Art. 18",
    order: 40,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_5",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-20",
    titleAr: "المادة 20: حق نقل وتصدير البيانات مقروءة آلياً (Data Portability)",
    titleEn: "Article 20: Right to Data Portability (JSON Export)",
    titleTr: "Madde 20: Veri Taşınabilirliği Hakkı",
    titleFr: "Article 20 : Droit à la portabilité des données",
    contentAr:
      "يحق لك تنزيل نسخة مهيكلة وشائعة الاستخدام ومقروءة آلياً (JSON) من جميع بيانات حسابك وحجوزاتك ونقلها دون أي قيود تقنية إلى أي مزود خدمة سفر آخر بضغطة زر واحدة.",
    contentEn:
      "Users have the statutory entitlement to receive their personal data in a structured, commonly used, machine-readable format (JSON) and transmit it to another controller unhindered.",
    contentTr:
      "Kullanıcılar tüm profil ve rezervasyon verilerini yapılandırılmış, makine tarafından okunabilir bir formatta (JSON) indirme ve başka bir sağlayıcıya aktarma hakkına sahiptir.",
    contentFr:
      "Les personnes concernées ont le droit de recevoir les données les concernant dans un format structuré, couramment utilisé et lisible par machine (JSON).",
    badge: "GDPR Art. 20",
    order: 50,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_6",
    targetDoc: "gdpr",
    sectionKey: "gdpr-art-21",
    titleAr: "المادة 21: حق الاعتراض وسحب الموافقة (Right to Object)",
    titleEn: "Article 21: Right to Object & Marketing Opt-Out",
    titleTr: "Madde 21: İtiraz Etme ve Onayı Geri Çekme Hakkı",
    titleFr: "Article 21 : Droit d'opposition et retrait du consentement",
    contentAr:
      "يحق لك في أي وقت الاعتراض على معالجة بياناتك لأغراض التسويق المباشر أو إشعارات العروض الترويجية، وسحب موافقتك بضغطة زر واحدة دون أن يؤثر ذلك على مشروعية المعالجة السابقة.",
    contentEn:
      "Travelers hold an absolute right to object to processing for direct marketing or promotional communications, with instantaneous one-click consent revocation.",
    contentTr:
      "Doğrudan pazarlama ve promosyon bildirimlerine dilediğiniz an tek tıkla itiraz etme ve onayınızı geri çekme hakkınız saklıdır.",
    contentFr:
      "La personne concernée a le droit de s'opposer à tout moment au traitement de ses données à des fins de prospection commerciale en un clic.",
    badge: "GDPR Art. 21",
    order: 60,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_7",
    targetDoc: "gdpr",
    sectionKey: "gdpr-chapter-v",
    titleAr: "الفصل الخامس: الضمانات والبنود التعاقدية القياسية (Chapter V SCCs)",
    titleEn: "Chapter V GDPR: International Safeguards & Standard Contractual Clauses",
    titleTr: "GDPR Bölüm V: Standart Sözleşme Maddeleri ve Uluslararası Güvenceler",
    titleFr: "Chapitre V RGPD : Clauses contractuelles types et garanties internationales",
    contentAr:
      "تعتمد منصتنا البنود التعاقدية القياسية الصادرة عن المفوضية الأوروبية (SCCs) مع جميع مزودي أنظمة التوزيع العالمية (GDS) وشركائنا التقنيين، لضمان استمرار ذات المستوى العالي من الحماية عند تدفق البيانات دولياً.",
    contentEn:
      "Our infrastructure implements European Commission Standard Contractual Clauses (SCCs) with all international GDS partners to guarantee equivalent levels of data protection across borders.",
    contentTr:
      "Platformumuz, uluslararası veri akışlarında eşdeğer koruma düzeyini garanti etmek amacıyla tüm GDS ortaklarıyla AB Standart Sözleşme Maddelerini (SCCs) uygulamaktadır.",
    contentFr:
      "Nous appliquons les clauses contractuelles types de la Commission européenne (CCT) avec nos partenaires techniques et GDS pour garantir un niveau de protection équivalent.",
    badge: "GDPR Chapter V",
    order: 70,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "gdpr_clause_8",
    targetDoc: "gdpr",
    sectionKey: "gdpr-retention",
    titleAr: "سياسة فترة السماح والاحتفاظ المشفر بالبيانات (Retention Grace Period)",
    titleEn: "Data Retention Holding Period & Statutory Grace Window",
    titleTr: "Güvenli Bekletme Süresi ve Yasal Cayma Penceresi",
    titleFr: "Période de rétention transitoire et délai de rétractation",
    contentAr:
      "عند تقديم طلب حذف الحساب، يدخل الحساب في حالة تجميد مشفرة لمدة سماح قانونية محددة (30 يوماً افتراضياً) تتيح للعميل التراجع وإلغاء الطلب، وبعد انقضائها يتم المسح النهائي والتطهير الرقمي غير القابل للاسترجاع.",
    contentEn:
      "Upon initiating an erasure request, accounts enter a secure holding state for a configurable grace period (default 30 days), after which irreversible automated data purging takes place.",
    contentTr:
      "Hesap silme talebinde bulunulduğunda, hesap 30 günlük yasal bekleme süresine alınır; bu sürede işlem iptal edilebilir, süre sonunda ise geri döndürülemez kalıcı silme gerçekleşir.",
    contentFr:
      "Lors d'une demande de suppression, le compte est placé en rétention sécurisée pendant 30 jours, permettant une annulation éventuelle avant l'effacement définitif et irréversible.",
    badge: "فترة السماح",
    order: 80,
    enabled: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];
