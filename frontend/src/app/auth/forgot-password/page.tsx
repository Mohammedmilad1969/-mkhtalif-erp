'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/hooks/useLanguage';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setError('');
    setSuccess(false);
    try {
      await post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || t('common.error'));
      } else {
        setError(t('common.error'));
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-2 pb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
          M
        </div>
        <CardTitle className="text-2xl">{t('auth.forgotPassword')}</CardTitle>
        <CardDescription>{t('auth.forgotSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm p-3 rounded-md">
              {t('auth.resetSent')}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('auth.sendResetLink')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
