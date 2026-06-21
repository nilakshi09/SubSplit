interface PaymentLinkOptions {
  amount: number;
  currency: string;
  upiId?: string;
  venmoHandle?: string;
  paypalEmail?: string;
  preferredMethod: string;
  note: string;
}

interface PaymentLink {
  method: string;
  url: string;
  label: string;
  icon: string;
}

export function generatePaymentLinks(options: PaymentLinkOptions): PaymentLink[] {
  const links: PaymentLink[] = [];
  const { amount, upiId, venmoHandle, paypalEmail, note } = options;

  // UPI Deep Link (India)
  if (upiId) {
    const params = new URLSearchParams({
      pa: upiId,
      pn: 'SubSplit',
      am: amount.toFixed(2),
      cu: 'INR',
      tn: note,
    });
    links.push({
      method: 'upi',
      url: `upi://pay?${params.toString()}`,
      label: `Pay ₹${amount.toFixed(2)} via UPI`,
      icon: '💳',
    });
  }

  // Venmo (US)
  if (venmoHandle) {
    const handle = venmoHandle.replace('@', '');
    links.push({
      method: 'venmo',
      url: `https://venmo.com/${handle}?txn=pay&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`,
      label: `Pay $${amount.toFixed(2)} via Venmo`,
      icon: '💙',
    });
  }

  // PayPal
  if (paypalEmail) {
    links.push({
      method: 'paypal',
      url: `https://paypal.me/${paypalEmail}/${amount.toFixed(2)}`,
      label: `Pay $${amount.toFixed(2)} via PayPal`,
      icon: '🅿️',
    });
  }

  // Sort: preferred method first
  links.sort((a, b) => {
    if (a.method === options.preferredMethod) return -1;
    if (b.method === options.preferredMethod) return 1;
    return 0;
  });

  return links;
}

export async function getPaymentLinksForSettlement(
  receiverId: string,
  amount: number,
  currency: string,
  note: string,
  supabaseAdmin: any
): Promise<PaymentLink[]> {
  const { data: receiver } = await supabaseAdmin
    .from('users')
    .select('upi_id, venmo_handle, paypal_email, preferred_payment')
    .eq('id', receiverId)
    .single();

  if (!receiver) return [];

  return generatePaymentLinks({
    amount,
    currency,
    upiId: receiver.upi_id,
    venmoHandle: receiver.venmo_handle,
    paypalEmail: receiver.paypal_email,
    preferredMethod: receiver.preferred_payment || 'upi',
    note,
  });
}
