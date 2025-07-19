import * as yup from 'yup';

export const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  CONFIRM_PASSWORD_MATCH: 'Passwords must match',
  REQUIRED_FIELD: 'This field is required',
} as const;

export const loginSchema = yup.object({
  email: yup.string().required(ERROR_MESSAGES.EMAIL_REQUIRED).email(ERROR_MESSAGES.EMAIL_INVALID).trim(),
  password: yup.string().required(ERROR_MESSAGES.PASSWORD_REQUIRED).min(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH).trim(),
});

export const registerSchema = yup.object({
  email: yup.string().required(ERROR_MESSAGES.EMAIL_REQUIRED).email(ERROR_MESSAGES.EMAIL_INVALID),
  password: yup
    .string()
    .required(ERROR_MESSAGES.PASSWORD_REQUIRED)
    .min(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ERROR_MESSAGES.PASSWORD_WEAK),
  confirmPassword: yup
    .string()
    .required(ERROR_MESSAGES.REQUIRED_FIELD)
    .oneOf([yup.ref('password')], ERROR_MESSAGES.CONFIRM_PASSWORD_MATCH),
  firstName: yup.string().required(ERROR_MESSAGES.REQUIRED_FIELD),
  lastName: yup.string().required(ERROR_MESSAGES.REQUIRED_FIELD),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
