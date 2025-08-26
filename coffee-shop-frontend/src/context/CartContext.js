import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        // Load cart from localStorage on initial render
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const saveCartToStorage = (items) => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    };

    const addToCart = (product, qty = 1) => {
        const exist = cartItems.find((x) => x._id === product._id);

        let newCartItems;
        if (exist) {
            newCartItems = cartItems.map((x) =>
                x._id === product._id ? { ...exist, qty: exist.qty + qty } : x
            );
        } else {
            newCartItems = [...cartItems, { ...product, qty }];
        }
        setCartItems(newCartItems);
        saveCartToStorage(newCartItems);
    };

    const removeFromCart = (productId) => {
        const newCartItems = cartItems.filter((x) => x._id !== productId);
        setCartItems(newCartItems);
        saveCartToStorage(newCartItems);
    };
    
    const updateQty = (productId, qty) => {
        const newCartItems = cartItems.map((x) => 
            x._id === productId ? { ...x, qty } : x
        );
        setCartItems(newCartItems);
        saveCartToStorage(newCartItems);
    };
    
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
