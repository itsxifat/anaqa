import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for guest checkout
  guestInfo: { // Store contact info if user is not logged in
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    image: String
  }],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    method: { type: String, enum: ['inside', 'outside'], default: 'inside' }
  },
  totalAmount: Number,
  paymentMethod: { type: String, default: 'COD' },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  orderId: { type: String, unique: true } // Short readable ID (e.g., #ANQ-1001)
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);