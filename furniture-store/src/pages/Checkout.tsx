import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonIcon, 
  IonText,
  IonList,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { checkmarkCircleOutline, arrowBackOutline, chevronBackOutline } from 'ionicons/icons';
import { getCart, clearCart } from '../utils/cart';
import { saveOrder } from '../utils/orders';
import orderService from '../services/orderService';
import './Checkout.css';
import { useAuth } from '../utils/AuthContext';
import { useHistory } from 'react-router-dom';

const paymentMethods = [
  { label: 'Credit Card', value: 'credit' },
  { label: 'UPI', value: 'upi' },
  { label: 'Cash on Delivery', value: 'cod' },
];

const Checkout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const cart = getCart();
  const subtotalCalc = cart.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [building, setBuilding] = useState('');
  const [payment, setPayment] = useState(paymentMethods[0].value);
  const [submitted, setSubmitted] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<'idle'|'saving'|'sent'|'error'>('idle');
  const [backendMsg, setBackendMsg] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (!loading && user) {
      setName(user.name || '');
      if ((user as any).phone) setPhone((user as any).phone);
      if ((user as any).pincode) setPincode((user as any).pincode);
      if ((user as any).address) setAddress((user as any).address);
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim() || !phone.trim() || !pincode.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (payment === 'upi' && !upiId.trim()) {
      alert('Please enter your UPI ID.');
      return;
    }
    
    const currentCart = getCart();
    const subtotal = currentCart.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
    
    const newOrder = {
      name,
      address,
      building,
      phone,
      pincode,
      payment,
      cardNumber: payment === 'credit' ? cardNumber : undefined,
      upiId: payment === 'upi' ? upiId : undefined,
      subtotal,
      items: currentCart,
      date: new Date().toISOString(),
    };
    
    setOrder(newOrder);
    setOrderStatus('saving');
    saveOrder(newOrder, user?._id);
    setOrderStatus('sent');
    setBackendMsg('');
    
    // Send to backend (falls back to local save)
    const result = await orderService.placeOrder(newOrder, user?._id);
    if (result && !result.error) {
      setBackendMsg(result.fallback ? 'Order saved locally (no backend).' : 'Order sent to backend successfully!');
    } else {
      setBackendMsg('Order saved locally, but failed to send to backend.');
      setOrderStatus('error');
    }
    
    clearCart();
    setSubmitted(true);
  };

  if (cart.length === 0 && !submitted) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/cart" icon={chevronBackOutline} />
            </IonButtons>
            <IonTitle>Checkout</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '20vh' }}>
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checking out.</p>
            <IonButton routerLink="/products" expand="block" shape="round">
              Browse Products
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cart" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
          {!isAuthenticated && !submitted && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push('/login?redirect=/checkout')}>
                Login
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {submitted ? (
          <div className="checkout-success ion-text-center">
            <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '64px', marginBottom: '16px' }} />
            <IonText color="dark">
              <h2>Order Placed!</h2>
              <p>Thank you for your order, <strong>{order?.name}</strong>!</p>
            </IonText>
            
            <IonCard className="ion-margin-top shadow-card">
              <IonCardHeader>
                <IonCardTitle>Order Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {order?.items?.map((item: any, idx: number) => (
                    <IonItem key={idx}>
                      <IonLabel>
                        <h3>{item.name}</h3>
                        <p>Qty: {item.qty || 1}</p>
                      </IonLabel>
                      <IonText slot="end">₹{(Number(item.price) * (item.qty || 1)).toLocaleString()}</IonText>
                    </IonItem>
                  ))}
                  <IonItem className="total-row">
                    <IonLabel><strong>Total Paid</strong></IonLabel>
                    <IonText slot="end" color="primary">
                      <strong>₹{order?.subtotal.toLocaleString()}</strong>
                    </IonText>
                  </IonItem>
                </IonList>
                <div className="ion-padding-top">
                  <p><strong>Shipping to:</strong> {order?.address}, {order?.building}, {order?.pincode}</p>
                  <p><strong>Payment:</strong> {paymentMethods.find(m => m.value === order?.payment)?.label}</p>
                  {orderStatus === 'sent' && backendMsg && <IonText color="success"><p>{backendMsg}</p></IonText>}
                  {orderStatus === 'error' && backendMsg && <IonText color="danger"><p>{backendMsg}</p></IonText>}
                </div>
              </IonCardContent>
            </IonCard>

            <IonButton expand="block" shape="round" className="ion-margin-top" routerLink="/home">
              Back to Home
            </IonButton>
          </div>
        ) : (
          <div className="checkout-wrapper">
            <div className="summary-banner">
              <IonText color="medium">
                <p>{cart.length} items • Total: <strong>₹{subtotalCalc.toLocaleString()}</strong></p>
              </IonText>
            </div>

            <form onSubmit={handleSubmit}>
              <IonCard className="shadow-card">
                <IonCardHeader>
                  <IonCardTitle>Shipping Details</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Full Name</IonLabel>
                    <IonInput 
                      value={name} 
                      onIonChange={e => setName(e.detail.value!)} 
                      required 
                    />
                  </IonItem>

                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Phone Number</IonLabel>
                    <IonInput 
                      type="tel" 
                      value={phone} 
                      onIonChange={e => setPhone(e.detail.value!.replace(/[^0-9]/g, '').slice(0, 10))} 
                      required 
                      maxlength={10}
                    />
                  </IonItem>

                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Building / Apt / Suite</IonLabel>
                    <IonInput 
                      value={building} 
                      onIonChange={e => setBuilding(e.detail.value!)} 
                      required 
                    />
                  </IonItem>

                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Street Address</IonLabel>
                    <IonInput 
                      value={address} 
                      onIonChange={e => setAddress(e.detail.value!)} 
                      required 
                    />
                  </IonItem>

                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Pincode</IonLabel>
                    <IonInput 
                      type="text" 
                      value={pincode} 
                      onIonChange={e => setPincode(e.detail.value!.replace(/[^0-9]/g, '').slice(0, 6))} 
                      required 
                      maxlength={6}
                    />
                  </IonItem>
                </IonCardContent>
              </IonCard>

              <IonCard className="shadow-card">
                <IonCardHeader>
                  <IonCardTitle>Payment Method</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="ion-margin-bottom">
                    <strong>Demo store:</strong> no payment is processed. Please don't enter real card details.
                  </p>
                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="floating">Select Method</IonLabel>
                    <IonSelect value={payment} onIonChange={e => setPayment(e.detail.value)}>
                      {paymentMethods.map(method => (
                        <IonSelectOption key={method.value} value={method.value}>
                          {method.label}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  {payment === 'credit' && (
                    <div className="payment-fields">
                      <IonItem className="ion-margin-bottom">
                        <IonLabel position="floating">Card Number</IonLabel>
                        <IonInput 
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber} 
                          onIonChange={e => setCardNumber(e.detail.value!.replace(/[^0-9]/g, '').slice(0, 16))} 
                          required 
                        />
                      </IonItem>
                      <IonGrid className="ion-no-padding">
                        <IonRow>
                          <IonCol size="6">
                            <IonItem className="ion-margin-bottom">
                              <IonLabel position="floating">Expiry (MM/YY)</IonLabel>
                              <IonInput 
                                placeholder="MM/YY"
                                value={expiry} 
                                onIonChange={e => setExpiry(e.detail.value!.replace(/[^0-9/]/g, '').slice(0, 5))} 
                                required 
                              />
                            </IonItem>
                          </IonCol>
                          <IonCol size="6">
                             <IonItem className="ion-margin-bottom">
                              <IonLabel position="floating">CVV</IonLabel>
                              <IonInput 
                                type="password" 
                                placeholder="***"
                                value={cvv} 
                                onIonChange={e => setCvv(e.detail.value!.replace(/[^0-9]/g, '').slice(0, 4))} 
                                required 
                              />
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </div>
                  )}

                  {payment === 'upi' && (
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="floating">UPI ID</IonLabel>
                      <IonInput 
                        placeholder="username@bank"
                        value={upiId} 
                        onIonChange={e => setUpiId(e.detail.value!)} 
                        required 
                      />
                    </IonItem>
                  )}
                </IonCardContent>
              </IonCard>

              <div className="ion-padding-vertical">
                <IonButton type="submit" expand="block" shape="round" size="large" className="place-order-btn">
                  Place Order • ₹{subtotalCalc.toLocaleString()}
                </IonButton>
              </div>
            </form>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Checkout;

