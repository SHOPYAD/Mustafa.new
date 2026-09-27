/// <reference path="../pb_data/types.d.ts" />

cronAdd("lonaliza-automation-tick", "* * * * *", () => {
  let secret = "";
  try {
    secret = String($os.readFile("/www/wwwroot/lonaliza.com/.data/automation/cron-secret") || "").trim();
  } catch (err) {
    secret = "";
  }
  if (!secret) {
    try {
      secret = String($os.readFile("/www/wwwroot/lonaliza.com/.data/email-cron-secret") || "").trim();
    } catch (err2) {
      secret = "";
    }
  }
  try {
    $http.send({
      url: "http://127.0.0.1:3047/api/cron/automation",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cron-Secret": secret,
      },
      timeout: 25,
    });
  } catch (err) {
    /* worker script is the fallback */
  }
});
