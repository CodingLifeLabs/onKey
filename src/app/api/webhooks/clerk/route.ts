import { Webhook } from 'svix';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: Request) {
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: { type: string; data: Record<string, unknown> };
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof evt;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createServiceClient();

  switch (evt.type) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = (email_addresses as Array<{ email_address: string }>)[0]
        ?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ');

      if (!id || !email) {
        return new Response('Missing required fields', { status: 400 });
      }

      const { error } = await supabase.from('profiles').insert({
        clerk_user_id: id,
        email,
        full_name: fullName || null,
      });

      if (error) {
        console.error('Failed to create profile:', error);
        return new Response('Failed to create profile', { status: 500 });
      }
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = (email_addresses as Array<{ email_address: string }>)[0]
        ?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ');

      if (!id) {
        return new Response('Missing user id', { status: 400 });
      }

      const updateData: Record<string, string> = {};
      if (email) updateData.email = email;
      if (fullName) updateData.full_name = fullName;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('clerk_user_id', id as string);

        if (error) {
          console.error('Failed to update profile:', error);
          return new Response('Failed to update profile', { status: 500 });
        }
      }
      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;
      if (!id) {
        return new Response('Missing user id', { status: 400 });
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('clerk_user_id', id as string);

      if (error) {
        console.error('Failed to delete profile:', error);
        return new Response('Failed to delete profile', { status: 500 });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${evt.type}`);
  }

  return new Response('OK', { status: 200 });
}
