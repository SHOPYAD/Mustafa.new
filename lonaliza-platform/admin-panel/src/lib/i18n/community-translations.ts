import type { Locale } from "@/lib/i18n/types";

export type CommunityTranslations = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  reelsButton: string;
  leaderboardButton: string;
  mobileWalletButton: string;
  mobileWalletSub: string;
  viewModal: string;
  allCategories: string;
  destinationLabel: string;
  allDestinations: string;
  feedTitle: string;
  postsCount: string;
  trending: string;
  latest: string;
  noPostsTitle: string;
  noPostsSub: string;
  shareExperience: string;
  walletTitle: string;
  walletSubtitle: string;
  pointsEarned: string;
  discountValue: string;
  redeemPoints: string;
  verticalReelsTitle: string;
  verticalReelsSub: string;
  tiersTitle: string;
  viewAll: string;
  pointsSuffix: string;
  verifiedBadgeTitle: string;
  verifiedBadgeText: string;
  writePlaceholder: string;
  publishPost: string;
  publishing: string;
  addPhoto: string;
  addVideo: string;
  rateTrip: string;
  enhanceAi: string;
  bookingVerified: string;
  verifiedGuest: string;
  postSuccess: string;
  like: string;
  comment: string;
  share: string;
  readMore: string;
  showLess: string;
};

const translations: Record<Locale, CommunityTranslations> = {
  ar: {
    heroTag: "مجتمع تجارب السفر والسياحة الفاخرة",
    heroTitle: "شارك تجاربك السياحية واكسب نقاط المكافآت",
    heroSubtitle: "تقييمات وتجارب حقيقية للفنادق، الجولات، والرحلات في تركيا والعالم. كل منشور يحقق تفاعل الجمهور يمنحك نقاطاً تُضاف لمحفظتك لتخفيض أسعار حجوزاتك القادمة مع لوناليزا!",
    reelsButton: "ريلز السفر (Reels)",
    leaderboardButton: "المتصدرون والمستويات",
    mobileWalletButton: "محفظة النقاط والمستويات",
    mobileWalletSub: "اضغط لعرض رصيدك، خصومات الحجز، ورتبتك",
    viewModal: "عرض النافذة",
    allCategories: "الكل",
    destinationLabel: "الوجهة:",
    allDestinations: "كل الوجهات",
    feedTitle: "تغذية تجارب المسافرين",
    postsCount: "تجربة",
    trending: "الأكثر تفاعلاً",
    latest: "الأحدث",
    noPostsTitle: "لا توجد منشورات حتى الآن",
    noPostsSub: "كن أول من يشارك تجربة سياحية ويكسب نقاط المكافآت عند وصول منشوره لتفاعل الجمهور!",
    shareExperience: "شارك تجربتك الآن",
    walletTitle: "محفظة نقاط السوشيال",
    walletSubtitle: "تُحوّل لخصومات حجز حقيقية",
    pointsEarned: "نقطة مجتمع مكتسبة",
    discountValue: "قيمة الخصم بالدولار",
    redeemPoints: "استبدال النقاط بحجوزات",
    verticalReelsTitle: "ريلز السفر العمودية",
    verticalReelsSub: "تصفح مقاطع فيديو قصيرة للتجارب والرحلات السياحية",
    tiersTitle: "مستويات ورتب المسافرين",
    viewAll: "عرض الكل",
    pointsSuffix: "+ نقطة",
    verifiedBadgeTitle: "تجارب سياحية حقيقية وموثوقة",
    verifiedBadgeText: "تقييمات وتجارب واقعية من مسافري لوناليزا في الفنادق والرحلات. المنشورات والمشاركات التي تحقق تفاعل الجمهور تمنحك نقاطاً تُخصم مباشرة من قيمة حجوزاتك القادمة.",
    writePlaceholder: "شارك تفاصيل رحلتك، الفندق، الخدمة، وأهم النصائح للمسافرين…",
    publishPost: "نشر التجربة وكسب النقاط",
    publishing: "جاري النشر وتوثيق المنشور…",
    addPhoto: "إضافة صور",
    addVideo: "إضافة فيديو",
    rateTrip: "التقييم العام",
    enhanceAi: "تحسين الصياغة بالذكاء الاصطناعي",
    bookingVerified: "حجز موثق ومؤكد",
    verifiedGuest: "مسافر موثق مع لوناليزا",
    postSuccess: "تم نشر تجربتك بنجاح! ستُضاف النقاط لمحفظتك فور وصول المنشور لشروط تفاعل الجمهور (50 إعجاب و 10 تعليقات).",
    like: "إعجاب",
    comment: "تعليق",
    share: "مشاركة",
    readMore: "قراءة المزيد",
    showLess: "عرض أقل",
  },
  en: {
    heroTag: "Luxury Travel & Experiences Community",
    heroTitle: "Share Your Travel Experiences & Earn Reward Points",
    heroSubtitle: "Authentic reviews and experiences for hotels, tours, and flights in Turkey and worldwide. Every post reaching audience engagement criteria earns points to your wallet to discount your next Lonaliza bookings!",
    reelsButton: "Travel Reels",
    leaderboardButton: "Leaderboard & Tiers",
    mobileWalletButton: "Points & Tiers Wallet",
    mobileWalletSub: "Tap to view balance, booking discounts, and rank",
    viewModal: "View Wallet",
    allCategories: "All",
    destinationLabel: "Destination:",
    allDestinations: "All Destinations",
    feedTitle: "Traveler Experiences Feed",
    postsCount: "experiences",
    trending: "Trending",
    latest: "Latest",
    noPostsTitle: "No experiences found yet",
    noPostsSub: "Be the first to share your travel story and earn rewards upon reaching engagement goals!",
    shareExperience: "Share Your Experience",
    walletTitle: "Social Points Wallet",
    walletSubtitle: "Converts to real booking discounts",
    pointsEarned: "Community points earned",
    discountValue: "Estimated discount in USD",
    redeemPoints: "Redeem Points on Bookings",
    verticalReelsTitle: "Vertical Travel Reels",
    verticalReelsSub: "Explore short video clips from curated trips and hotels",
    tiersTitle: "Traveler Ranks & Tiers",
    viewAll: "View All",
    pointsSuffix: "+ pts",
    verifiedBadgeTitle: "Authentic & Verified Experiences",
    verifiedBadgeText: "Real reviews and impressions from verified Lonaliza guests. Every post achieving audience engagement earns points directly applicable to your future trips.",
    writePlaceholder: "Share details of your trip, hotel stay, service, and tips for travelers…",
    publishPost: "Publish Story & Earn Points",
    publishing: "Publishing your story…",
    addPhoto: "Add Photos",
    addVideo: "Add Video",
    rateTrip: "Overall Rating",
    enhanceAi: "Enhance with AI",
    bookingVerified: "Verified Booking",
    verifiedGuest: "Verified Lonaliza Traveler",
    postSuccess: "Your experience was published! Reward points will be credited to your wallet once your post hits audience engagement goals (50 likes & 10 comments).",
    like: "Like",
    comment: "Comment",
    share: "Share",
    readMore: "Read more",
    showLess: "Show less",
  },
  tr: {
    heroTag: "Lüks Seyahat ve Deneyimler Topluluğu",
    heroTitle: "Seyahat Deneyimlerinizi Paylaşın ve Ödül Puanları Kazanın",
    heroSubtitle: "Türkiye ve dünyadaki oteller, turlar ve uçuşlar için gerçek deneyimler ve incelemeler. Hedeflenen etkileşime ulaşan her paylaşım, Lonaliza ile sonraki rezervasyonlarınızda indirim sağlayan puanlar kazandırır!",
    reelsButton: "Seyahat Reels",
    leaderboardButton: "Liderler ve Seviyeler",
    mobileWalletButton: "Puanlar ve Seviyeler Cüzdanı",
    mobileWalletSub: "Bakiyenizi, rezervasyon indirimlerinizi ve rütbenizi görün",
    viewModal: "Cüzdanı Gör",
    allCategories: "Tümü",
    destinationLabel: "Destinasyon:",
    allDestinations: "Tüm Destinasyonlar",
    feedTitle: "Gezgin Deneyimleri Akışı",
    postsCount: "deneyim",
    trending: "Trendler",
    latest: "En Yeniler",
    noPostsTitle: "Henüz paylaşım bulunamadı",
    noPostsSub: "İlk seyahat deneyiminizi paylaşarak etkileşimle ödül puanları kazanın!",
    shareExperience: "Deneyiminizi Paylaşın",
    walletTitle: "Sosyal Puan Cüzdanı",
    walletSubtitle: "Gerçek rezervasyon indirimlerine dönüşür",
    pointsEarned: "Kazanılan topluluk puanı",
    discountValue: "Dolar bazında indirim değeri",
    redeemPoints: "Puanları Rezervasyonda Kullan",
    verticalReelsTitle: "Dikey Seyahat Videoları",
    verticalReelsSub: "Seçkin turlar ve otellerden kısa video klipleri keşfedin",
    tiersTitle: "Gezgin Rütbeleri ve Seviyeler",
    viewAll: "Tümünü Gör",
    pointsSuffix: "+ puan",
    verifiedBadgeTitle: "Doğrulanmış ve Güvenilir Deneyimler",
    verifiedBadgeText: "Lonaliza gezginlerinin otel ve turlardaki gerçek değerlendirmeleri. Etkileşim hedefine ulaşan her paylaşım bir sonraki seyahatinizde doğrudan indirim kazandırır.",
    writePlaceholder: "Seyahatiniz, oteliniz ve gezginler için önemli tavsiyelerinizi paylaşın…",
    publishPost: "Paylaş ve Puan Kazan",
    publishing: "Paylaşılıyor…",
    addPhoto: "Fotoğraf Ekle",
    addVideo: "Video Ekle",
    rateTrip: "Genel Puan",
    enhanceAi: "Yapay Zeka ile İyileştir",
    bookingVerified: "Doğrulanmış Rezervasyon",
    verifiedGuest: "Doğrulanmış Lonaliza Gezgini",
    postSuccess: "Deneyiminiz başarıyla yayınlandı! Gönderiniz etkileşim hedefine ulaştığında (50 beğeni ve 10 yorum) ödül puanlarınız cüzdanınıza eklenecektir.",
    like: "Beğen",
    comment: "Yorum Yap",
    share: "Paylaş",
    readMore: "Devamını oku",
    showLess: "Daha az göster",
  },
  fr: {
    heroTag: "Communauté de Voyages & Expériences de Luxe",
    heroTitle: "Partagez Vos Expériences de Voyage et Gagnez des Points",
    heroSubtitle: "Avis et expériences authentiques pour les hôtels, circuits et vols en Turquie et dans le monde. Chaque publication atteignant l'objectif d'engagement vous rapporte des points pour réduire vos prochaines réservations !",
    reelsButton: "Reels de Voyage",
    leaderboardButton: "Classement et Niveaux",
    mobileWalletButton: "Portefeuille Points & Niveaux",
    mobileWalletSub: "Consultez votre solde, vos réductions et votre rang",
    viewModal: "Voir le Portefeuille",
    allCategories: "Tous",
    destinationLabel: "Destination :",
    allDestinations: "Toutes les Destinations",
    feedTitle: "Fil d'Expériences des Voyageurs",
    postsCount: "expériences",
    trending: "Tendances",
    latest: "Plus Récents",
    noPostsTitle: "Aucune expérience pour le moment",
    noPostsSub: "Soyez le premier à partager votre voyage et gagnez des récompenses après interaction du public !",
    shareExperience: "Partager Votre Expérience",
    walletTitle: "Portefeuille de Points Sociaux",
    walletSubtitle: "Convertible en remises réelles de réservation",
    pointsEarned: "Points de communauté acquis",
    discountValue: "Valeur de réduction estimée en USD",
    redeemPoints: "Utiliser mes Points en Réservation",
    verticalReelsTitle: "Reels Verticaux de Voyage",
    verticalReelsSub: "Découvrez des vidéos courtes de nos circuits et hôtels d'exception",
    tiersTitle: "Rangs et Niveaux Voyageurs",
    viewAll: "Tout Afficher",
    pointsSuffix: "+ pts",
    verifiedBadgeTitle: "Expériences Authentiques & Vérifiées",
    verifiedBadgeText: "Avis vérifiés de nos clients Lonaliza en hôtels et circuits. Chaque publication engagée vous fait économiser sur vos futurs séjours.",
    writePlaceholder: "Partagez vos souvenirs de voyage, votre hôtel et vos meilleurs conseils…",
    publishPost: "Publier et Gagner des Points",
    publishing: "Publication en cours…",
    addPhoto: "Ajouter des Photos",
    addVideo: "Ajouter une Vidéo",
    rateTrip: "Note Globale",
    enhanceAi: "Améliorer avec l'IA",
    bookingVerified: "Réservation Vérifiée",
    verifiedGuest: "Voyageur Lonaliza Vérifié",
    postSuccess: "Votre expérience a été publiée ! Vos points seront crédités dès que votre publication aura atteint les conditions d'engagement (50 j'aime et 10 commentaires).",
    like: "J'aime",
    comment: "Commenter",
    share: "Partager",
    readMore: "Lire la suite",
    showLess: "Réduire",
  },
};

export function getCommunityTranslations(locale: Locale): CommunityTranslations {
  return translations[locale] || translations.en;
}
