import { handle, json, parseBody } from '@/lib/server/http';
import { findUserByEmail } from '@/lib/server/repos/users-repo';

export const POST = handle(async (req) => {
  const { email } = await parseBody<{ email: string }>(req);
  const user = findUserByEmail(email ?? '');
  // For the demo build there is no email provider, so return a demo token
  // (the user id) that the reset-password page can use.
  return json({
    message: 'If the email exists, a reset link has been sent',
    demoToken: user ? user.id : undefined,
  });
});
