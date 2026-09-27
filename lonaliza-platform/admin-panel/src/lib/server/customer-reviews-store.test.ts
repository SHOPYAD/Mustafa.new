import { describe, it, expect } from "vitest";
import {
  sanitizeReviewText,
  submitCustomerReview,
  getServiceCustomerReviews,
  getCustomerReviews,
  deleteCustomerReview,
  getAllReviewsAdmin,
  moderateReviewAdmin,
  updateReviewsSettings,
  getReviewsSettings,
} from "@/lib/server/customer-reviews-store";

describe("Unified Customer Verified Reviews System", () => {
  it("strictly sanitizes input against XSS, HTML tags, and spam hyperlinks", () => {
    const malicious = `
      <script>alert('pwned')</script>
      <b style="color:red">Fantastic stay!</b>
      Check out my discount at https://spam-site.com/affiliate and www.phishing.org
    `;
    const cleaned = sanitizeReviewText(malicious);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("<b>");
    expect(cleaned).not.toContain("https://");
    expect(cleaned).not.toContain("www.phishing.org");
    expect(cleaned).toContain("Fantastic stay!");
  });

  it("submits a verified customer review with rating bounded between 1 and 5", async () => {
    const userId = `test_user_${Date.now()}`;
    const result = await submitCustomerReview({
      userId,
      userName: "أحمد مسافر VIP",
      serviceType: "hotel",
      serviceId: "hotel_cvk_park",
      serviceName: "CVK Park Bosphorus Hotel",
      bookingId: `bk_test_${Date.now()}`,
      rating: 6, // Should be clamped to 5
      title: "إقامة استثنائية <script>",
      comment: "فندق راقي جداً وخدمة الغرف سريعة وإطلالة لا تعوض على البوسفور.",
    });

    expect(result.ok).toBe(true);
    expect(result.review).toBeDefined();
    expect(result.review?.rating).toBe(5);
    expect(result.review?.title).not.toContain("<script>");

    // Check retrieving reviews for the service
    const serviceReviews = await getServiceCustomerReviews("hotel", "hotel_cvk_park");
    expect(serviceReviews.reviews.length).toBeGreaterThan(0);
    expect(serviceReviews.stats.count).toBeGreaterThan(0);
    expect(serviceReviews.stats.average).toBeGreaterThanOrEqual(1);
    expect(serviceReviews.stats.average).toBeLessThanOrEqual(5);

    // Check customer's own reviews
    const myReviews = await getCustomerReviews(userId);
    expect(myReviews.length).toBe(1);
    expect(myReviews[0].id).toBe(result.review?.id);

    // Test deletion
    const delRes = await deleteCustomerReview(userId, result.review!.id);
    expect(delRes.ok).toBe(true);

    const afterDel = await getCustomerReviews(userId);
    expect(afterDel.length).toBe(0);
  });

  it("admin can toggle auto-approve and moderate reviews", async () => {
    // Toggle auto-approve
    await updateReviewsSettings({ autoApprove: false });
    const settingsFalse = await getReviewsSettings();
    expect(settingsFalse.autoApprove).toBe(false);

    // Submit while auto-approve is false -> should be pending
    const userId = `admin_test_user_${Date.now()}`;
    const subRes = await submitCustomerReview({
      userId,
      userName: "سارة خالد",
      serviceType: "transfer",
      serviceId: "vip_mercedes_vito",
      serviceName: "مرسيدس فيتو مع سائق خاص",
      bookingId: `bk_transfer_${Date.now()}`,
      rating: 5,
      title: "سائق محترم ودقيق بالمواعيد",
      comment: "السائق كان بانتظارنا في المطار بسيارة نظيفة جداً ومعقمة.",
    });

    expect(subRes.ok).toBe(true);
    expect(subRes.review?.status).toBe("pending");

    const reviewId = subRes.review!.id;

    // Admin approves review
    await moderateReviewAdmin(reviewId, "approve");
    let all = await getAllReviewsAdmin();
    let found = all.find((r) => r.id === reviewId);
    expect(found?.status).toBe("approved");

    // Admin hides review
    await moderateReviewAdmin(reviewId, "hide", "Suspicious content");
    all = await getAllReviewsAdmin();
    found = all.find((r) => r.id === reviewId);
    expect(found?.status).toBe("hidden");

    // Admin deletes review
    await moderateReviewAdmin(reviewId, "delete");
    all = await getAllReviewsAdmin();
    found = all.find((r) => r.id === reviewId);
    expect(found).toBeUndefined();

    // Re-enable auto-approve
    await updateReviewsSettings({ autoApprove: true });
    const settingsTrue = await getReviewsSettings();
    expect(settingsTrue.autoApprove).toBe(true);
  });
});
