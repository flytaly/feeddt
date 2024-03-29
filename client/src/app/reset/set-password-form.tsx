import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { resetPasswordAction, ResetPasswordValidationError } from '@/app/(actions)/reset-password';
import PasswordIcon from '@/assets/key.svg';
import { MessageItem } from '@/components/card/animated-message';
import InputWithIcon from '@/components/forms/icon-input';
import { useSubmitHandler } from '@/hooks/use-submit-handler';

interface SetPasswordProps {
  token: string;
  userId: string;
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function SetPasswordForm({ setMessages, token, userId }: SetPasswordProps) {
  const [validationError, setValidationError] = useState<ResetPasswordValidationError>(null);

  const router = useRouter();

  async function processForm(data: FormData) {
    const result = await resetPasswordAction(data);
    if (!result) return;

    setValidationError(result.error);
    if (!result.response || !setMessages) return;

    const { user, errors } = result.response;

    if (!user) {
      setMessages?.([{ type: 'error', key: 'error', text: errors?.[0].message }]);
      return;
    }
    router.push('/');
  }

  const { isSubmitting, submitHandler } = useSubmitHandler(processForm, setMessages);

  return (
    <form className="flex flex-col w-full" action={resetPasswordAction} onSubmit={submitHandler}>
      <InputWithIcon
        id="password"
        type="Password"
        name="password"
        IconSVG={PasswordIcon}
        placeholder="Password"
        title="Password"
        error={validationError?.password?._errors[0]}
        min={8}
        required
      />
      <InputWithIcon
        id="confirm-password"
        type="Password"
        name="confirm"
        IconSVG={PasswordIcon}
        placeholder="Confirm password"
        title="Confirm password"
        error={validationError?.confirm?._errors[0]}
        min={8}
        required
      />
      <input value={token} type="hidden" name="token" />
      <input value={userId} type="hidden" name="userId" />
      <button
        type="submit"
        className="submit-btn w-full text-xl tracking-wider"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registration...' : 'Register'}
      </button>
    </form>
  );
}
