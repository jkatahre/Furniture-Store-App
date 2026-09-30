import { getProducts } from '../services/productService';
import { Product } from '../utils/types';
import { star as starIcon, colorPalette, cartOutline, homeOutline, personOutline, listOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonBackButton, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonIcon } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';

type Params = {
  id: string;
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<Params>();
  const history = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        const found = data.find(p => p.id === Number(id));
        setProduct(found || null);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) return <IonPage><IonContent>Loading piece details...</IonContent></IonPage>;
  if (!product) return <IonPage><IonContent>Product not found.</IonContent></IonPage>;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/products" />
            <IonButton onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/products')}>
              <IonIcon icon={listOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={() => history.push('/cart')}>
              <IonIcon icon={cartOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={() => history.push('/profile')}>
              <IonIcon icon={personOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard style={{ maxWidth: 420, margin: '32px auto', borderRadius: 18, boxShadow: '0 4px 16px #0002' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: 260, objectFit: 'cover', borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
          <IonCardHeader style={{ padding: '18px 20px 0 20px' }}>
            <IonCardTitle style={{ fontSize: 24, fontWeight: 700 }}>{product.name}</IonCardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0 0 0' }}>
              <IonBadge color="success" style={{ fontSize: 15, padding: '6px 12px', borderRadius: 12 }}>₹{product.price.toLocaleString()}</IonBadge>
              <IonBadge color="warning" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IonIcon icon={starIcon} style={{ fontSize: 16, marginRight: 2 }} />
                {product.rating}
              </IonBadge>
              <IonBadge color={product.stock > 0 ? 'primary' : 'medium'} style={{ fontSize: 13 }}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</IonBadge>
            </div>
          </IonCardHeader>
          <IonCardContent style={{ padding: 20 }}>
            <div style={{ fontSize: 16, color: '#444', marginBottom: 16 }}>{product.description}</div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 600, marginRight: 8 }}>Colors:</span>
              {product.colors?.map((c: string) => (
                <span key={c} title={c} style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: c.toLowerCase() === 'colorful' ? 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' : c.toLowerCase(),
                  border: '1.5px solid #ccc',
                  marginRight: 6,
                  verticalAlign: 'middle',
                }} />
              ))}
            </div>
            <IonButton expand="block" color="success" size="large" style={{ marginBottom: 12 }} onClick={() => history.push(`/cart?add=${product.id}`)} disabled={product.stock === 0}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.goBack()}>
              Back
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProductDetails;
