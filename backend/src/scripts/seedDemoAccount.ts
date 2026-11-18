import bcrypt from "bcryptjs";
import { Shop } from "../models/Shop";
import { User } from "../models/User";

const DEMO_EMAIL = "owner@aurajewel.com";
const DEMO_PASSWORD = "password123";

export async function seedDemoAccount(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    return;
  }

  let slug = "aurajewel-demo";
  let suffix = 1;
  while (await Shop.exists({ slug })) {
    slug = `aurajewel-demo-${suffix++}`;
  }

  const shop = await Shop.create({
    name: "AuraJewel Demo Boutique",
    slug,
    email: DEMO_EMAIL,
    status: "active",
  });
  const user = await User.create({
    shopId: shop._id,
    name: "Demo Owner",
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    role: "shop_owner",
    isActive: true,
  });

  shop.ownerId = user._id;
  await shop.save();
  console.log(`[DB] Created development demo account: ${DEMO_EMAIL}`);
}
