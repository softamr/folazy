'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For App Router
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const createLoginSchema = (isSignup: boolean) => z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: isSignup 
    ? z.string().min(8, 'Password must be at least 8 characters') 
    : z.string().optional(),
}).refine(data => !isSignup || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path to field that gets the error
});


interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === 'signup';
  const authFormSchema = createLoginSchema(isSignup);
  type AuthFormValues = z.infer<typeof authFormSchema>;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true);
    console.log(`${mode} submitted:`, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful authentication
    // In a real app: set auth token in localStorage/cookie, update global auth state
    // localStorage.setItem('isAuthenticated', 'true'); 
    
    setIsLoading(false);
    alert(`${isSignup ? 'Signup' : 'Login'} successful! Redirecting...`);
    router.push('/profile'); // Redirect to profile page after login/signup
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isSignup ? 'Create an Account' : 'Welcome Back!'}
        </CardTitle>
        <CardDescription>
          {isSignup ? 'Join MarketSquare today.' : 'Log in to continue to MarketSquare.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground"/>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Lock className="h-4 w-4 mr-2 text-muted-foreground"/>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSignup && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Lock className="h-4 w-4 mr-2 text-muted-foreground"/>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>{isSignup ? 'Signing up...' : 'Logging in...'}</>
              ) : (
                isSignup ? (
                  <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>
                ) : (
                  <><LogIn className="mr-2 h-4 w-4" /> Log In</>
                )
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={isSignup ? '/auth/login' : '/auth/signup'}>
              {isSignup ? 'Log in' : 'Sign up'}
            </Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
