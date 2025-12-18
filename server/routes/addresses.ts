import { Router } from "express";
import jwt from "jsonwebtoken";
import { db, schema } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify token and get user ID
function getUserId(req: any): number | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

// Get all addresses for current user
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const addresses = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.userId, userId))
      .orderBy(desc(schema.addresses.createdAt));

    res.json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Save new address
router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { address, lat, lng } = req.body;

    if (!address || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Address, lat, and lng are required" });
    }

    const [newAddress] = await db
      .insert(schema.addresses)
      .values({ userId, address, lat, lng })
      .returning();

    res.status(201).json({ address: newAddress });
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete address
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const addressId = parseInt(req.params.id);

    // Verify ownership
    const [address] = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.id, addressId))
      .limit(1);

    if (!address || address.userId !== userId) {
      return res.status(404).json({ message: "Address not found" });
    }

    await db.delete(schema.addresses).where(eq(schema.addresses.id, addressId));

    res.json({ message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

