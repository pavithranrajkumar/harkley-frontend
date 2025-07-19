import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../constants/validation';
import { useAuth } from '../hooks/useAuth';
import { TextInput } from '../components/input/TextInput';
import { PasswordInput } from '../components/input/PasswordInput';
import { Button } from '../components/ui/Button';
import { OAuthButton } from '../components/auth/OAuthButton';
import { Logo } from '../components/ui/Logo';

const LoginPage = () => {
  const { login, loginWithGoogle, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: 'demo@harkley.ai',
      password: 'password',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data);
    if (!result.success && result.error) {
      setError('root', {
        type: 'manual',
        message: result.error,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError('root', {
        type: 'manual',
        message: result.error,
      });
    }
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left Side - Branding (60%) */}
      <div className='hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12'>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className='text-center text-white'>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className='mb-8'>
            <Logo size='lg' className='text-white' />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className='text-4xl font-bold mb-6'
          >
            Your AI Meeting Assistant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className='text-xl text-blue-100 max-w-md mx-auto leading-relaxed'
          >
            Transform your meetings with AI-powered transcription, insights, and action items. Never miss important details again.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Login Form (40%) */}
      <div className='w-full lg:w-2/5 flex items-center justify-center p-8'>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
            {/* Logo inside the card */}
            <div className='text-center mb-8'>
              <Logo size='md' />
              <p className='text-gray-600 mt-4'>Sign in to your Harkley AI account</p>
            </div>
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='mb-6 p-3 bg-red-50 border border-red-200 rounded-lg'
              >
                <p className='text-red-600 text-sm'>{errors.root.message}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div>
                <TextInput
                  {...register('email')}
                  label='Email address'
                  type='email'
                  placeholder='Enter your email'
                  error={errors.email?.message}
                  leftIcon={<Mail size={16} />}
                />
              </div>

              <div>
                <PasswordInput
                  {...register('password')}
                  label='Password'
                  placeholder='Enter your password'
                  error={errors.password?.message}
                  leftIcon={<Lock size={16} />}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div></div>
                <a href='#' className='text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline'>
                  Forgot password?
                </a>
              </div>

              <Button type='submit' loading={isLoading} className='w-full' size='lg'>
                Sign in
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                </div>
              </div>

              <OAuthButton provider='google' loading={isLoading} onClick={handleGoogleSignIn} className='w-full'>
                Sign in with Google
              </OAuthButton>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
