
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IonContent, IonPage, IonButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonButtons, IonIcon, IonHeader, IonToolbar, IonTitle, IonMenuButton } from '@ionic/react';
import { cartOutline, personOutline, listOutline } from 'ionicons/icons';
import './Home.css';
import HeroSlider from './HeroSlider';
import { useHistory } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { Product } from '../utils/types';


const Home: React.FC = () => {
  const history = useHistory();
  const placeholder = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // derive featured categories from products data (top 4 by count)
  const categoryImages: Record<string, string> = {
    Sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=60',
    Table: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=60',
    Chair: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=60',
    Bed: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60',
    Desk: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=60',
    Storage: 'https://images.unsplash.com/photo-1595514535415-8120e36b8da9?auto=format&fit=crop&w=800&q=60',
    Accessory: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=60',
  };

  const featuredCategories = useMemo(() => {
    return Object.keys(categoryImages).slice(0, 4).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      img: categoryImages[name],
    }));
  }, []);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);


  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        console.log(data)
        setProducts(data);
      } catch (error) {
        console.error('Error fetching home products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let rafId = 0;
    let pos = track.scrollLeft;
    const speed = 0.6; // pixels per frame
    function step() {
      if (!paused && track) {
        pos += speed;
        track.scrollLeft = pos;
        
        // If we reached the max scroll, or past half the width
        if (pos >= track.scrollWidth / 2 || pos >= track.scrollWidth - track.clientWidth - 1) {
          pos = 0;
          track.scrollLeft = pos;
        }
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [paused, featuredCategories]);

  // featured products: top 8 by rating
  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [products]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Furniture Store</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/products">
              <IonIcon icon={listOutline} slot="icon-only" />
            </IonButton>
            <IonButton routerLink="/cart">
              <IonIcon icon={cartOutline} slot="icon-only" />
            </IonButton>
            <IonButton routerLink="/profile">
              <IonIcon icon={personOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Hero slider (simple React implementation) */}
        <HeroSlider onCta={() => history.push('/products')} />

        {/* Categories (horizontal auto-scrolling carousel) */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginLeft: 4 }}>Featured Categories</h3>
          <div className="category-carousel">
            <div className="category-track" ref={trackRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              {[...featuredCategories, ...featuredCategories].map((cat, idx) => (
                <div key={`${cat.id}-${idx}`} style={{ width: 220 }}>
                  <IonCard className="category-card" onClick={() => history.push(`/products?category=${cat.id}`)}>
                    <img
                      src={cat.img || placeholder}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => { 
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.dataset.hasError) {
                          target.dataset.hasError = 'true';
                          target.src = placeholder;
                        }
                      }}
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                    <IonCardHeader>
                      <IonCardTitle>{cat.name}</IonCardTitle>
                    </IonCardHeader>
                  </IonCard>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Shop by Category removed per request */}

        {/* Featured products */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginLeft: 1 }}>Featured Products</h3>
          <IonGrid>
            <IonRow>
              {featuredProducts.map((p: any) => (
                <IonCol size="6" sizeMd="3" key={p.id}>
                  <IonCard className="product-card">
                    <img
                      src={p.image || placeholder}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => { 
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.dataset.hasError) {
                          target.dataset.hasError = 'true';
                          target.src = placeholder;
                        }
                      }}
                      onClick={() => history.push(`/product/${p.id}`)}
                      style={{ width: '100%', height: 160, objectFit: 'cover', cursor: 'pointer' }}
                    />
                    <IonCardHeader>
                      <IonCardTitle style={{ fontSize: 16 }}>{p.name}</IonCardTitle>
                      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>₹{p.price.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{p.rating} ★</div>
                      </div>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
