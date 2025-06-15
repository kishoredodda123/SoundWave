
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await authService.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        username: data.username,
      });

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Error signing up with Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-music-darkBg via-music-secondary to-music-darkBg">
      <div className="flex items-start justify-center p-4 py-6 sm:py-8 min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <Music className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-music-primary mr-2" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">SoundWave</h1>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">Create your account</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Join the music revolution today</p>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-3 sm:mb-4 md:mb-6 bg-white hover:bg-gray-100 text-black border-0 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
              onClick={handleGoogleSignUp}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative mb-3 sm:mb-4 md:mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-black/40 text-gray-400">or</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-2 sm:space-y-3">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-xs sm:text-sm">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-music-primary h-8 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-xs sm:text-sm">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Choose a username"
                          className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-music-primary h-8 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-xs sm:text-sm">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-music-primary pl-7 sm:pl-10 h-8 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                          />
                        </div>
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
                      <FormLabel className="text-white text-xs sm:text-sm">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-music-primary pr-8 sm:pr-10 h-8 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                          />
                          <button
                            type="button"
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-xs sm:text-sm">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-music-primary pr-8 sm:pr-10 h-8 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                          />
                          <button
                            type="button"
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 sm:pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-music-primary hover:bg-music-primary/90 text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Footer */}
            <div className="text-center mt-3 sm:mt-4 md:mt-6">
              <p className="text-gray-400 text-xs sm:text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-music-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
