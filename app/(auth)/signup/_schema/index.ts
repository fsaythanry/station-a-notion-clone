import { z } from "zod"

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Required'})
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, {
      message: "Must contain at least 8 character(s), one lowercase letter, one uppercase letter, and one digit (0-9).",
    })
    .max(72, {
      message: "Must contain at most 72 character(s)",
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/, {
      message:
        "Must contain at least 8 character(s), one lowercase letter, one uppercase letter, and one digit (0-9).",
    })
    .trim(),
})

export type SignUpSchema = z.infer<typeof signUpSchema>
