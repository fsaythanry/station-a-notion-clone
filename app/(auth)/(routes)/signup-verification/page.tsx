"use client"
import ErrorBlock from "@/components/error-block"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getApiError } from "@/lib/error/api-error"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon, MailCheckIcon } from "lucide-react"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { useCountdown } from "usehooks-ts"
import { z } from "zod"

const signUpSchema = z.object({
  code: z.string({ required_error: "Invalid verification code" }).min(4, {
    message: "Invalid verification code",
  }),
})

const emailSchema = z.string().email()

export default function SignUpOTP() {
  const router = useRouter()

  const params = useSearchParams()
  const verifyMailto = emailSchema.safeParse(params.get("mailto"))
  const email = verifyMailto.success ? verifyMailto.data : undefined

  const [count, { startCountdown }] = useCountdown({
    countStart: 60,
  })
  const showCountdown = count != 0 && count < 60

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
  })

  // todo
  const submitHandler = form.handleSubmit(async ({ code }) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email!,
        token: code,
        type: "email",
      })

      if (error) {
        // rate limit error
        if (error.status === 429) throw new Error("")
        // user not found
        if (error.status === 404) return router.replace(`/signup`)

        throw new Error(error.message)
      }

      router.replace("/docs")
    } catch (error) {
      form.setError("root.apiError", {
        message:
          error instanceof Error && error.message && typeof error.message === "string"
            ? error.message
            : "Something went wrong! Try again in a few minutes",
      })
    }
  })

  const resendHandler = async () => {
    startCountdown()
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: email! })

      if (error) {
        // rate limit error
        if (error.status === 429) throw new Error("")
        throw new Error(error.message)
      }

      form.setError("root.apiError", { message: undefined })
    } catch (error) {
      form.setError("root.apiError", { message: getApiError(error) })
    }
  }

  if (!email) return redirect("/signup")

  const {
    formState: { isSubmitting, isValid, errors, isSubmitSuccessful },
  } = form

  const isDisableSubmit = !isValid || isSubmitting || isSubmitSuccessful
  const isLoadingSubmit = isSubmitting || isSubmitSuccessful

  return (
    <>
      <MailCheckIcon className="mb-4 h-20 w-20" />

      <h1 className="mb-2 text-3xl font-bold md:text-4xl">Check your email</h1>

      <p className="mb-8 w-full text-center text-sm">
        To complete your signup, we&apos;ve sent the verification code to{" "}
        <strong>{email}</strong> to verify your email.
      </p>

      <Form {...form}>
        <form
          onSubmit={submitHandler}
          className="flex w-full flex-col gap-y-3"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter the verification code..."
                    type="text"
                    inputSize="lg"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            size="lg"
            className="w-full"
            variant="outline-blue"
            type="submit"
            disabled={isDisableSubmit}
          >
            {isLoadingSubmit && (
              <LoaderIcon className="animate mr-2 h-4 w-4 animate-spin" />
            )}
            Verify Email
          </Button>

          <ErrorBlock message={errors.root?.apiError.message} />
        </form>
      </Form>

      <hr className="my-8 w-full border-zinc-200" />

      <div className="w-full text-left text-sm">
        <p className="mb-2 font-medium">Didn&apos;t receive email ?</p>
        <ol className="list-inside list-disc">
          <li>Check your spam or junk folder.</li>
          <li>
            <Button
              variant="link-blue"
              className={cn("h-auto p-0", showCountdown && "no-underline")}
              onClick={resendHandler}
              disabled={showCountdown}
            >
              {showCountdown
                ? `Resend verification code again in (${count}s)`
                : !showCountdown && "Click here"}
            </Button>
            {!showCountdown && ` to resend the verification code.`}
          </li>
        </ol>
      </div>
    </>
  )
}
