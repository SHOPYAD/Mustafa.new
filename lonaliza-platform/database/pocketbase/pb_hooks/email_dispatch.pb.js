/// <reference path="../pb_data/types.d.ts" />

cronAdd("lonaliza-email-dispatch", "* * * * *", () => {
  let secret = "";
  try {
    secret = String($os.readFile("/www/wwwroot/lonaliza.com/.data/email-cron-secret") || "").trim();
  } catch (err) {
    secret = "";
  }
  try {
    $http.send({
      url: "http://127.0.0.1:3047/api/cron/email-dispatch",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cron-Secret": secret,
      },
      timeout: 25,
    });
  } catch (err) {
    /* Next scheduler is the live fallback until this hook is loaded */
  }
});
