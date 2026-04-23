import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const WEBHOOK_SECRET = process.env.STEADFAST_WEBHOOK_SECRET;

// Steadfast courier status → our internal order status + payment status
const STATUS_MAP = {
  delivered:          { status: 'Delivered',   paymentStatus: 'Paid' },
  partial_delivered:  { status: 'Delivered',   paymentStatus: 'Paid' },
  cancelled:          { status: 'Cancelled',   paymentStatus: 'Pending' },
  hold:               { status: 'Processing',  paymentStatus: 'Pending' },
  in_review:          { status: 'Shipped',     paymentStatus: 'Pending' },
  pending:            { status: 'Shipped',     paymentStatus: 'Pending' },
  picked_up:          { status: 'Shipped',     paymentStatus: 'Pending' },
  in_transit:         { status: 'Shipped',     paymentStatus: 'Pending' },
  out_for_delivery:   { status: 'Shipped',     paymentStatus: 'Pending' },
  returned:           { status: 'Returned',    paymentStatus: 'Pending' },
  partial_returned:   { status: 'Returned',    paymentStatus: 'Pending' },
};

export async function POST(req) {
  try {
    // 1. Auth
    const headerList = await headers();
    const authHeader = headerList.get('authorization');

    if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body
    let data;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Steadfast sends either a single event or an array
    const events = Array.isArray(data) ? data : [data];

    await connectDB();

    const results = await Promise.allSettled(
      events.map(event => processEvent(event))
    );

    const summary = results.map((r, i) => ({
      index: i,
      status: r.status,
      value: r.status === 'fulfilled' ? r.value : r.reason?.message,
    }));

    return NextResponse.json({ success: true, processed: summary });

  } catch (error) {
    console.error('Steadfast webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function processEvent(event) {
  const { invoice, status, consignment_id } = event;

  if (!invoice || !status) {
    return { skipped: true, reason: 'Missing invoice or status' };
  }

  const mapping = STATUS_MAP[status.toLowerCase()];
  if (!mapping) {
    // Unknown status — still record it, keep current order status
    await Order.findOneAndUpdate(
      { orderId: invoice },
      { courier_status: status },
    );
    return { invoice, courierStatus: status, action: 'courier_status_only' };
  }

  const update = {
    courier_status: status,
    status: mapping.status,
    paymentStatus: mapping.paymentStatus,
    ...(consignment_id ? { consignment_id } : {}),
  };

  const updated = await Order.findOneAndUpdate(
    { orderId: invoice },
    update,
    { new: true }
  );

  if (!updated) {
    return { invoice, action: 'not_found' };
  }

  return {
    invoice,
    courierStatus: status,
    newStatus: mapping.status,
    action: 'updated',
  };
}
