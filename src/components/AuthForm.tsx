
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react'; // Added UserIcon
import { useState } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type AuthError
} from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';


const createLoginSchema = (isSignup: boolean) => z.object({
  name: isSignup 
    ? z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters')
    : z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(isSignup ? 8 : 6, `Password must be at least ${isSignup ? 8 : 6} characters`),
  confirmPassword: isSignup 
    ? z.string().min(8, 'Password must be at least 8 characters') 
    : z.string().optional(),
}).refine(data => !isSignup || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); 

  const isSignup = mode === 'signup';
  const authFormSchema = createLoginSchema(isSignup);
  type AuthFormValues = z.infer<typeof authFormSchema>;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleFirebaseAuthError = (error: AuthError) => {
    let message = 'An unexpected error occurred. Please try again.';
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address format.';
        break;
      case 'auth/user-disabled':
        message = 'This user account has been disabled.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': 
        message = 'Invalid email or password.';
        break;
      case 'auth/email-already-in-use':
        message = 'This email address is already in use.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. It must be at least 6 characters long.';
        break;
      default:
        console.error(`${mode} error:`, error);
        message = error.message || message; 
    }
    toast({
      title: `${isSignup ? 'Signup' : 'Login'} Failed`,
      description: message,
      variant: 'destructive',
    });
  };

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true);
    try {
      if (isSignup) {
        if (!data.name) { // Should be caught by Zod, but good to double check
          toast({ title: 'Signup Failed', description: 'Name is required.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        // Create user document in Firestore
        const userDocData: User = {
          id: firebaseUser.uid, // Use UID as the document ID and the id field
          name: data.name,
          email: data.email,
          joinDate: new Date().toISOString(),
          isAdmin: false, // Default for new users
          avatarUrl: '', // Default avatar or let user upload later
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userDocData);
        
        toast({
          title: 'Signup Successful!',
          description: 'You have successfully created an account. Redirecting...',
        });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: 'Login Successful!',
          description: 'Welcome back! Redirecting...',
        });
      }
      router.push('/profile'); 
    } catch (error) {
      handleFirebaseAuthError(error as AuthError);
    } finally {
      setIsLoading(false);
    }
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
            {isSignup && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><UserIcon className="h-4 w-4 mr-2 text-muted-foreground"/>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                   {isSignup && <FormDescription>Password must be at least 8 characters.</FormDescription>}
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

