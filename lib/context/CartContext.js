'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('anaqa_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('anaqa_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1, size = null) => {
    setCart((prev) => {
      // Check if item with same ID (and size if applicable) exists
      const existingIndex = prev.findIndex(
        (item) => item._id === product._id && item.selectedSize === size
      );

      if (existingIndex >= 0) {
        // Update quantity
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prev, { ...product, quantity, selectedSize: size }];
      }
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((item) => !(item._id === id && item.selectedSize === size)));
  };

  const updateQuantity = (id, size, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item._id === id && item.selectedSize === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Derived Values
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const price = item.discountPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);