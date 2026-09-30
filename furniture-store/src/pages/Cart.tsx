

import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonButton, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonIcon, IonLabel, IonModal } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { trashOutline, homeOutline, listOutline, personOutline } from 'ionicons/icons';
import { getProducts } from '../services/productService';
import { Product } from '../utils/types';
import Login from './Login';

const Cart: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const isLoggedIn = !!localStorage.getItem('user');

  useEffect(() => {
    const fetchAndSyncCart = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
        
        const params = new URLSearchParams(location.search);
        const addId = params.get('add');
        let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (addId) {
          const prod = data.find(p => p.id === Number(addId));
          if (prod) {
            const idx = currentCart.findIndex((item: any) => item.id === prod.id);
            if (idx > -1) {
              currentCart[idx].qty = (currentCart[idx].qty || 1) + 1;
            } else {
              currentCart.push({ ...prod, qty: 1 });
            }
          }
          localStorage.setItem('cart', JSON.stringify(currentCart));
          // Clear the URL param to avoid multiple adds on refresh
          history.replace(location.pathname);
        }

        // Sync with latest product data
        currentCart = currentCart.map((item: any) => {
          const prod = data.find(p => p.id === item.id);
          return prod ? { ...prod, qty: item.qty } : item;
        });

        setCart(currentCart);
      } catch (error) {
        console.error('Error in cart sync:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSyncCart();
  }, [location.search, history]);

  const updateCart = (newCart: any) => {
    setCart([...newCart]);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleQtyChange = (idx: number, qty: number) => {
    const newCart = [...cart];
    newCart[idx].qty = qty > 0 ? qty : 1;
    updateCart(newCart);
  };

  const handleRemove = (idx: number) => {
    const newCart = cart.filter((_: any, i: number) => i !== idx);
    updateCart(newCart);
  };

  const handleApplyCoupon = () => {
    // Simple demo: coupon 'SAVE10' gives 10% off
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setDiscount(0.1);
    } else {
      setDiscount(0);
    }
  };

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * (item.qty || 1), 0);
  const total = subtotal - subtotal * discount;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      setAuthKey((prev: number) => prev + 1);
      return;
    }
    (history as any).push('/checkout');
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
            <IonButton onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Shopping Cart</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/products')}>
              <IonIcon icon={listOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={() => history.push('/profile')}>
              <IonIcon icon={personOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {cart.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
            <IonImg src="https://media.istockphoto.com/id/518263573/photo/cute-dog-shopping.jpg?s=612x612&w=0&k=20&c=YV85y72uoawSxk7WzHwpnIciJlXKr_UtpFy7wL7nBoI=" alt="Cute dog shopping" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: '50%', background: '#f8f8f8', aspectRatio: '1/1', display: 'block' }} />
            <h3 style={{ margin: 0, fontWeight: 700, color: '#444' }}>Your cart is empty!</h3>
            <p style={{ color: '#888', marginTop: 8 }}>Looks like you haven't added anything yet.<br />Start shopping and fill your cart with joy!</p>
          </div>
        )}
        <IonList>
          {cart.map((item: any, idx: number) => (
            <IonCard key={idx} style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: 180 }}>
                <IonImg src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <IonButton fill="clear" color="danger" onClick={() => handleRemove(idx)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(255,255,255,0.7)' }}>
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              </div>
              <IonCardHeader style={{ paddingTop: 12, paddingLeft: 16, paddingRight: 16, display: 'block' }}>
                <IonCardTitle style={{ textAlign: 'left', fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{item.name}</IonCardTitle>
                <IonLabel color="medium" style={{ textAlign: 'left', display: 'block', fontSize: 15, marginBottom: 2 }}>₹{item.price}</IonLabel>
              </IonCardHeader>
              <IonCardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IonLabel style={{ marginRight: 4 }}>Qty:</IonLabel>
                  <IonInput
                    type="number"
                    min={1}
                    value={item.qty || 1}
                    onIonChange={e => handleQtyChange(idx, Number(e.detail.value))}
                    style={{ width: 60 }}
                  />
                </div>
                <IonLabel style={{ fontWeight: 700, fontSize: 16 }}><b>₹{(item.price * (item.qty || 1)).toLocaleString()}</b></IonLabel>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>
        {cart.length > 0 && (
          <div style={{ maxWidth: 400, margin: '32px auto 0', padding: 24, borderRadius: 16, background: '#f8f8f8', boxShadow: '0 2px 8px #0001' }}>
            <div style={{ marginBottom: 16 }}>
              <IonLabel>Coupon code:</IonLabel>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <IonInput value={coupon} placeholder="Enter coupon (e.g. SAVE10)" onIonChange={e => setCoupon(e.detail.value!)} />
                <IonButton size="small" onClick={handleApplyCoupon}>Apply</IonButton>
              </div>
              {discount > 0 && <IonLabel color="success">Coupon applied! 10% off</IonLabel>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <IonLabel>Subtotal:</IonLabel>
              <IonLabel>₹{subtotal.toLocaleString()}</IonLabel>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <IonLabel>Discount:</IonLabel>
                <IonLabel color="success">- ₹{(subtotal * discount).toLocaleString()}</IonLabel>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
              <IonLabel>Total:</IonLabel>
              <IonLabel>₹{total.toLocaleString()}</IonLabel>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <IonButton expand="block" color="success" style={{ flex: 1 }} onClick={handleCheckout}>Checkout</IonButton>
              <IonButton expand="block" color="primary" fill="outline" style={{ flex: 1 }} onClick={() => history.push('/products')}>
                Continue Shopping
              </IonButton>
            </div>
            <IonModal isOpen={showAuth} onDidDismiss={() => setShowAuth(false)}>
              <div style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Login key={authKey} redirectTo="/checkout" onSuccess={() => setShowAuth(false)} />
              </div>
            </IonModal>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cart;
