'use client';

import Link from 'next/link';
import { useState } from 'react';

import { MessageItem } from '@/components/card/animated-message';
import FormSide from '@/components/card/form-side';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';

import LoginForm from './login-form';

const initialMessages: MessageItem[] = [
  {
    text: 'Log in to manage your feeds or change settings',
    key: 'login-message',
    static: true,
  },
  {
    content: (
      <>
        <span>To reset or create new password&nbsp;</span>
        <Link href="request-reset" className="text-primary underline">
          click here
        </Link>
      </>
    ),
    key: 'digest-message',
  },
];

export default function Login() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <SmallCard>
      <MessagesSide items={[...initialMessages, ...messages]} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Log in</h2>
        <LoginForm setMessages={setMessages} />
      </FormSide>
    </SmallCard>
  );
}
