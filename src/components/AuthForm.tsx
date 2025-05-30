
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
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type AuthError
} from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    // Form schema messages (basic)
    nameMin: "Name must be at least 2 characters",
    nameMax: "Name cannot exceed 50 characters",
    invalidEmail: "Invalid email address",
    passwordMinSignup: "Password must be at least 8 characters",
    passwordMinLogin: "Password must be at least 6 characters",
    confirmPasswordMin: "Password must be at least 8 characters",
    passwordsDontMatch: "Passwords don't match",
    // Component text
    createAccountTitle: "Create an Account",
    welcomeBackTitle: "Welcome Back!",
    joinMarketSquareDesc: "Join MarketSquare today.",
    loginToContinueDesc: "Log in to continue to MarketSquare.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "Confirm Password",
    passwordDescSignup: "Password must be at least 8 characters.",
    signUpButton: "Sign Up",
    logInButton: "Log In",
    signingUpProgress: "Signing up...",
    loggingInProgress: "Logging in...",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    logInLink: "Log in",
    signUpLink: "Sign up",
    // Toast messages
    signupFailedTitle: "Signup Failed",
    loginFailedTitle: "Login Failed",
    nameRequiredError: "Name is required.",
    signupSuccessTitle: "Signup Successful!",
    signupSuccessDesc: "You have successfully created an account. Redirecting...",
    loginSuccessTitle: "Login Successful!",
    loginSuccessDesc: "Welcome back! Redirecting...",
    // Auth error messages (Firebase specific, can be genericized more)
    authInvalidEmail: "Invalid email address format.",
    authAccountDisabled: "This user account has been disabled.",
    authInvalidCredential: "Invalid email or password.", // Covers user-not-found & wrong-password
    authEmailInUse: "This email address is already in use.",
    authWeakPassword: "Password is too weak. It must be at least 6 characters long.",
    authUnexpectedError: "An unexpected error occurred. Please try again.",
    authSignupIssue: "Signup Issue",
    authPermissionDeniedSignup: "Signup succeeded with authentication, but failed to save user details. Please check database permissions."
  },
  ar: {
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل",
    nameMax: "لا يمكن أن يتجاوز الاسم 50 حرفًا",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    passwordMinSignup: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
    passwordMinLogin: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    confirmPasswordMin: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
    passwordsDontMatch: "كلمات المرور غير متطابقة",
    createAccountTitle: "إنشاء حساب",
    welcomeBackTitle: "أهلاً بعودتك!",
    joinMarketSquareDesc: "انضم إلى ماركت سكوير اليوم.",
    loginToContinueDesc: "سجل الدخول للمتابعة إلى ماركت سكوير.",
    fullNameLabel: "الاسم الكامل",
    fullNamePlaceholder: "فلان الفلاني",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "your@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    passwordDescSignup: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    signUpButton: "إنشاء حساب",
    logInButton: "تسجيل الدخول",
    signingUpProgress: "جار إنشاء الحساب...",
    loggingInProgress: "جار تسجيل الدخول...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    dontHaveAccount: "ليس لديك حساب؟",
    logInLink: "تسجيل الدخول",
    signUpLink: "إنشاء حساب",
    signupFailedTitle: "فشل إنشاء الحساب",
    loginFailedTitle: "فشل تسجيل الدخول",
    nameRequiredError: "الاسم مطلوب.",
    signupSuccessTitle: "تم إنشاء الحساب بنجاح!",
    signupSuccessDesc: "لقد أنشأت حسابًا بنجاح. جار إعادة التوجيه...",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح!",
    loginSuccessDesc: "أهلاً بعودتك! جار إعادة التوجيه...",
    authInvalidEmail: "صيغة عنوان البريد الإلكتروني غير صالحة.",
    authAccountDisabled: "تم تعطيل حساب المستخدم هذا.",
    authInvalidCredential: "البريد الإلكتروني أو كلمة المرور غير صالحة.",
    authEmailInUse: "عنوان البريد الإلكتروني هذا مستخدم بالفعل.",
    authWeakPassword: "كلمة المرور ضعيفة جدًا. يجب أن تتكون من 6 أحرف على الأقل.",
    authUnexpectedError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authSignupIssue: "مشكلة في إنشاء الحساب",
    authPermissionDeniedSignup: "نجح إنشاء الحساب بالمصادقة، ولكن فشل حفظ تفاصيل المستخدم. يرجى التحقق من أذونات قاعدة البيانات."
  }
};

const createLoginSchema = (isSignup: boolean, t: typeof translations['en'] | typeof translations['ar']) => z.object({
  name: isSignup 
    ? z.string().min(2, t.nameMin).max(50, t.nameMax)
    : z.string().optional(),
  email: z.string().email(t.invalidEmail),
  password: z.string().min(isSignup ? 8 : 6, isSignup ? t.passwordMinSignup : t.passwordMinLogin),
  confirmPassword: isSignup 
    ? z.string().min(8, t.confirmPasswordMin) 
    : z.string().optional(),
}).refine(data => !isSignup || data.password === data.confirmPassword, {
  message: t.passwordsDontMatch,
  path: ["confirmPassword"],
});

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); 
  const { language } = useLanguage();
  const t = translations[language];

  const isSignup = mode === 'signup';
  const authFormSchema = createLoginSchema(isSignup, t);
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

  const handleAuthError = (error: AuthError) => {
    let message = t.authUnexpectedError;
    switch (error.code) {
      case 'auth/invalid-email': message = t.authInvalidEmail; break;
      case 'auth/user-disabled': message = t.authAccountDisabled; break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': message = t.authInvalidCredential; break;
      case 'auth/email-already-in-use': message = t.authEmailInUse; break;
      case 'auth/weak-password': message = t.authWeakPassword; break;
      default:
        console.error(`${mode} error (Auth specific):`, error);
        message = error.message || message; 
    }
    toast({
      title: isSignup ? t.signupFailedTitle : t.loginFailedTitle,
      description: message,
      variant: 'destructive',
    });
  };

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true);
    try {
      if (isSignup) {
        if (!data.name) {
          toast({ title: t.signupFailedTitle, description: t.nameRequiredError, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        const userDocData: User = {
          id: firebaseUser.uid,
          name: data.name,
          email: data.email,
          joinDate: new Date().toISOString(),
          isAdmin: false,
          avatarUrl: '',
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userDocData);
        
        toast({
          title: t.signupSuccessTitle,
          description: t.signupSuccessDesc,
        });
        setIsLoading(false);
        router.push('/profile'); 
      } else { // Login
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: t.loginSuccessTitle,
          description: t.loginSuccessDesc,
        });
        setIsLoading(false);
        router.push('/profile'); 
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Operation failed:", error); 

      if (error.code && typeof error.code === 'string' && error.code.startsWith('auth/')) {
        handleAuthError(error as AuthError);
      } else {
        let description = error.message || t.authUnexpectedError;
        if (error.code === 'permission-denied' && isSignup) {
          description = t.authPermissionDeniedSignup;
        }
        toast({
          title: isSignup ? t.authSignupIssue : t.loginFailedTitle,
          description: description,
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isSignup ? t.createAccountTitle : t.welcomeBackTitle}
        </CardTitle>
        <CardDescription>
          {isSignup ? t.joinMarketSquareDesc : t.loginToContinueDesc}
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
                    <FormLabel className="flex items-center"><UserIcon className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} text-muted-foreground`}/>{t.fullNameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.fullNamePlaceholder} {...field} />
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
                  <FormLabel className="flex items-center"><Mail className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} text-muted-foreground`}/>{t.emailLabel}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t.emailPlaceholder} {...field} />
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
                  <FormLabel className="flex items-center"><Lock className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} text-muted-foreground`}/>{t.passwordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                  </FormControl>
                   {isSignup && <FormDescription>{t.passwordDescSignup}</FormDescription>}
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
                    <FormLabel className="flex items-center"><Lock className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} text-muted-foreground`}/>{t.confirmPasswordLabel}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>{isSignup ? t.signingUpProgress : t.loggingInProgress}</>
              ) : (
                isSignup ? (
                  <><UserPlus className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.signUpButton}</>
                ) : (
                  <><LogIn className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.logInButton}</>
                )
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isSignup ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={isSignup ? '/auth/login' : '/auth/signup'}>
              {isSignup ? t.logInLink : t.signUpLink}
            </Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
