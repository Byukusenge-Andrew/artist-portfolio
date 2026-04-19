import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("user_session")?.value;

  if (sessionToken) {
    try {
      const payload = await verifyToken(sessionToken);
      if (payload && payload.jti) {
        // Delete the session from database (revocation)
        await prisma.session.delete({
          where: { id: payload.jti },
        }).catch(() => {
          // Ignore if session already deleted or doesn't exist
        });
      }
    } catch (error) {
      console.error("Error during session revocation:", error);
    }
  }

  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);

  // Clear the cookie
  res.cookies.delete("user_session");

  return res;
}
