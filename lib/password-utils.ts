/**
 * Password Utilities
 * 
 * Client-safe password validation functions.
 * These functions contain no server-side dependencies and can be used in both
 * client and server components.
 */

/**
 * Check password strength
 * Returns: weak, medium, strong
 */
export function checkPasswordStrength(password: string): "weak" | "medium" | "strong" {
    if (password.length < 8) return "weak";

    let strength = 0;

    // Length check
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++; // lowercase
    if (/[A-Z]/.test(password)) strength++; // uppercase
    if (/[0-9]/.test(password)) strength++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength++; // special chars

    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
}

/**
 * Validate password meets minimum requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    // Check for common weak passwords
    const commonPasswords = ["password", "12345678", "qwerty", "abc123", "password123"];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push("This password is too common. Please choose a stronger password");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
