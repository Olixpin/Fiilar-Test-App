const puppeteer = require("puppeteer");

(async () => {
  const url = "http://localhost:3000/";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Create a new listing directly in localStorage and dispatch the event
    const listing = {
      id: "test_listing_001",
      hostId: "host_123",
      title: "Yaba Sundown",
      description: "Live - Lagos Nigeria",
      type: "Apartment",
      price: 10000,
      priceUnit: "DAILY",
      location: "Lagos, Nigeria",
      status: "LIVE",
      images: ["https://picsum.photos/800/600?random=1"],
      tags: ["test"],
      availability: {},
      requiresIdentityVerification: false,
      proofOfAddress: "",
      settings: { allowRecurring: true, minDuration: 1, instantBook: false },
      capacity: 1,
      includedGuests: 1,
      pricePerExtraGuest: 0,
      cautionFee: 0,
      addOns: [],
      cancellationPolicy: "MODERATE",
      houseRules: [],
      safetyItems: [],
    };

    const injected = await page.evaluate((listing) => {
      const KEY = "fiilar_listings";
      const raw = localStorage.getItem(KEY);
      let arr = raw ? JSON.parse(raw) : [];
      // remove any previous test listing
      arr = arr.filter((l) => l.id !== listing.id);
      arr.push(listing);
      localStorage.setItem(KEY, JSON.stringify(arr));

      // ensure session user exists (host)
      const USER_KEY = "fiilar_user";
      const host = {
        id: "host_123",
        name: "Jane Host",
        email: "jane@example.com",
        role: "HOST",
        isHost: true,
        createdAt: new Date().toISOString(),
        kycVerified: true,
        walletBalance: 1250,
        avatar: "",
        favorites: [],
        authProvider: "email",
        emailVerified: true,
        phoneVerified: false,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(host));

      // Dispatch the custom event listeners expect
      try {
        window.dispatchEvent(
          new CustomEvent("fiilar:listings-updated", { detail: { listing } })
        );
      } catch (e) {
        // ignore
      }
      return true;
    }, listing);

    // Reload the page to let React pick up state or navigate to home
    await page.reload({ waitUntil: "networkidle0" });

    // Wait for some time for app to render listings
    await page.waitForTimeout(1000);

    // Check if the listing appears on the page by searching for its title text
    const found = await page.evaluate(() => {
      const text = document.body.innerText || "";
      return text.includes("Yaba Sundown");
    });

    if (found) {
      console.log("SUCCESS: Listing found on the homepage.");
      await browser.close();
      process.exit(0);
    } else {
      console.error("FAIL: Listing not found on the homepage.");
      // For debugging, capture a screenshot
      await page.screenshot({
        path: "create_and_verify_listing.png",
        fullPage: true,
      });
      await browser.close();
      process.exit(2);
    }
  } catch (err) {
    console.error("Error during test:", err);
    try {
      await page.screenshot({
        path: "create_and_verify_listing_error.png",
        fullPage: true,
      });
    } catch (e) {}
    await browser.close();
    process.exit(3);
  }
})();
