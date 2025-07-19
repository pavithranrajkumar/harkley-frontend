import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '../constants/validation';
import { useAuth } from '../hooks/useAuth';
import { TextInput } from '../components/input/TextInput';
import { PasswordInput } from '../components/input/PasswordInput';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await signup({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
    });

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
            Join Harkley AI Today
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className='text-xl text-blue-100 max-w-md mx-auto leading-relaxed'
          >
            Start transforming your meetings with AI-powered transcription, insights, and action items. Create your account and never miss important
            details again.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Signup Form (40%) */}
      <div className='w-full lg:w-2/5 flex items-center justify-center p-8'>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
            {/* Back to Login Link */}
            <div className='mb-6'>
              <Link to='/login' className='inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'>
                <ArrowLeft size={16} className='mr-2' />
                Back to Sign In
              </Link>
            </div>

            {/* Logo inside the card */}
            <div className='text-center mb-8'>
              <Logo size='md' />
              <p className='text-gray-600 mt-4'>Create your Harkley AI account</p>
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
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <TextInput
                    {...register('firstName')}
                    label='First Name'
                    placeholder='Enter your first name'
                    error={errors.firstName?.message}
                    leftIcon={<User size={16} />}
                  />
                </div>
                <div>
                  <TextInput
                    {...register('lastName')}
                    label='Last Name'
                    placeholder='Enter your last name'
                    error={errors.lastName?.message}
                    leftIcon={<User size={16} />}
                  />
                </div>
              </div>

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
                  placeholder='Create a password'
                  error={errors.password?.message}
                  leftIcon={<Lock size={16} />}
                />
              </div>

              <div>
                <PasswordInput
                  {...register('confirmPassword')}
                  label='Confirm Password'
                  placeholder='Confirm your password'
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock size={16} />}
                />
              </div>

              <Button type='submit' loading={isLoading} className='w-full' size='lg'>
                Create Account
              </Button>

              <div className='text-center text-sm text-gray-600'>
                Already have an account?{' '}
                <Link to='/login' className='text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline'>
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
