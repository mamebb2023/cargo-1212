import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(150, "First name must be 150 characters or fewer"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(150, "Last name must be 150 characters or fewer"),
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one A-Z, one a-z, and one 0-9"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    street: z
      .string()
      .min(1, "Street address is required")
      .min(3, "Street address must be at least 3 characters"),
    zipCode: z
      .string()
      .min(1, "Zip code is required")
      .regex(/^[\d\w\s-]+$/, "Please enter a valid zip code"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
