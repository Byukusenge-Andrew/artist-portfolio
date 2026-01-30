import { z } from "zod";

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

    // JWT Authentication
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

    // Node Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Site URL
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    // Stripe (required in production)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Cloudinary (optional)
    CLOUDINARY_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Supabase (optional)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety
 */
export const env = envSchema.parse(process.env);

/**
 * Validate environment on startup
 * Call this in your app initialization
 */
export function validateEnvironment() {
    try {
        envSchema.parse(process.env);
        console.log("✅ Environment variables validated successfully");
        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Environment validation failed:");
            error.issues.forEach((err: z.ZodIssue) => {
                console.error(`  - ${err.path.join(".")}: ${err.message}`);
            });
        }
        throw new Error("Environment validation failed. Please check your .env file.");
    }
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
    return !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
    return !!(
        env.CLOUDINARY_URL ||
        (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
    );
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
