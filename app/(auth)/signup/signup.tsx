import ErrorBlock from "@/components/error-block"
import InputPasswordWrapper from "@/components/input-password-wrapper"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoaderIcon } from "lucide-react"
import Link from "next/link"
import Footer from "../_components/footer"
import { FacebookButton, GoogleButton } from "../_components/oauth-button"
import { useSignUp } from "./_hooks/use-signup"

export default function SignUpPage() {
  const { errors, form, isDisableSubmit, isLoadingSubmit, submitHandler } = useSignUp()

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Sign up</h1>

      <Form {...form}>
        <form
          onSubmit={submitHandler}
          className="flex w-full flex-col gap-y-3"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address..."
                    type="text"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputPasswordWrapper
                    error={fieldState.error}
                    render={({ showPassword }) => (
                      <Input
                        className="peer border-0 "
                        placeholder={showPassword ? "Enter your password..." : "********"}
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                    )}
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
            Continue with Email & Password
          </Button>

          <ErrorBlock message={errors.root?.apiError.message} />
        </form>
      </Form>

      <hr className="my-8 w-full border-zinc-200" />

      <GoogleButton />
      <FacebookButton />

      <div className="mt-6 flex justify-center gap-x-1 text-sm">
        <p className="text-zinc-700">Have an account?</p>

        <Button variant="link-blue" className="h-auto p-0 font-normal" asChild>
          <Link href="/login">Log in here</Link>
        </Button>
      </div>

      <Footer />
    </>
  )
}