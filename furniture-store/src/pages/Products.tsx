import Login from './Login';
import React, { useState, useMemo, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonRange,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonSkeletonText,
  IonMenuButton,
} from '@ionic/react';
import { filterOutline, closeOutline, trashOutline, homeOutline, cartOutline, personOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { Product } from '../utils/types';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Products: React.FC = () => {
  const history = useHistory();
  const query = useQuery();
  const categoryParam = query.get('category') || '';

  // Auth modal state and buy handler
  const [showAuth, setShowAuth] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const isLoggedIn = !!localStorage.getItem('user');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleBuy = (product: Product) => {
    if (!isLoggedIn) {
      setShowAuth(true);
      setAuthKey(prev => prev + 1);
      return;
    }
    history.push(`/product/${product.id}`);
  };

  const placeholder = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop';

  // Filter & Search state
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Price range state
  const [minAvailable, setMinAvailable] = useState(0);
  const [maxAvailable, setMaxAvailable] = useState(100000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Color state
  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: Product) => {
      if (p.colors) p.colors.forEach((c: string) => set.add(c));
    });
    return Array.from(set).sort();
  }, [products]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
        
        if (data.length > 0) {
          const prices = data.map((p) => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinAvailable(min);
          setMaxAvailable(max);
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const formatCurrency = (v: number) => `₹${v.toLocaleString()}`;

  const unslugify = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products].filter((p: Product) => {
      // Category filter
      if (categoryParam) {
        const pCat = (p.category || '').toLowerCase().replace(/\s+/g, '-');
        if (pCat !== categoryParam.toLowerCase()) return false;
      }

      // Search filter
      if (searchText && !(p.name || '').toLowerCase().includes(searchText.toLowerCase())) return false;

      // Price filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

      // Color filter
      if (selectedColors.length > 0) {
        if (!p.colors || !p.colors.some((c: string) => selectedColors.includes(c))) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a: Product, b: Product) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a: Product, b: Product) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a: Product, b: Product) => b.rating - a.rating);

    return result;
  }, [products, categoryParam, searchText, priceRange, selectedColors, sortBy]);

  const clearFilters = () => {
    setPriceRange([minAvailable, maxAvailable]);
    setSelectedColors([]);
    setSearchText('');
  };

  const renderProductCard = (p: any) => (
    <IonCard 
      className="product-card" 
      style={{ 
        margin: 0, 
        height: '100%', 
        borderRadius: 20, 
        overflow: 'hidden', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)', 
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Image Section */}
      <div 
        style={{ position: 'relative', height: 200, cursor: 'pointer', overflow: 'hidden' }}
        onClick={() => history.push(`/product/${p.id}`)}
      >
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
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="product-img"
        />
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <IonBadge color="light" style={{ opacity: 0.9, padding: '4px 8px', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <span style={{ color: '#f5a623' }}>★</span> {p.rating}
          </IonBadge>
        </div>
      </div>

      {/* Content Section */}
      <IonCardHeader style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: '#888' }}>{p.category}</div>
          <div style={{ display: 'flex' }}>
            {p.colors?.slice(0, 3).map((c: string, idx: number) => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c.toLowerCase() === 'colorful' ? 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' : c.toLowerCase(), border: '1px solid #fff', zIndex: 3 - idx, marginLeft: idx > 0 ? -6 : 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title={c} />
            ))}
          </div>
        </div>
        
        <IonCardTitle style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </IonCardTitle>
        
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#000', marginBottom: 12 }}>
            ₹{p.price.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <IonButton 
              fill="outline" 
              size="small" 
              onClick={() => history.push(`/product/${p.id}`)}
              style={{ flex: 1, margin: 0, '--border-radius': '8px' }}
            >
              Details
            </IonButton>
            <IonButton 
              fill="solid" 
              size="small" 
              color="primary" 
              onClick={(e: any) => { e.stopPropagation(); handleBuy(p); }}
              style={{ flex: 1, margin: 0, '--border-radius': '8px' }}
            >
              Buy
            </IonButton>
          </div>
        </div>
      </IonCardHeader>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--padding-top': '8px', '--padding-bottom': '8px' }}>
          <IonButtons slot="start">
            <IonMenuButton />
            <IonButton onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontSize: 24, fontWeight: 700 }}>{categoryParam ? unslugify(categoryParam) : 'Collections'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/cart')}>
              <IonIcon icon={cartOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={() => history.push('/profile')}>
              <IonIcon icon={personOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={filterOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar 
            value={searchText} 
            onIonInput={e => setSearchText(e.detail.value!)} 
            placeholder="Search premium furniture..."
            style={{ '--border-radius': '12px', padding: '0 16px 0px' }}
          />
        </IonToolbar>
        <div 
          className="no-scrollbar"
          style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            padding: '8px 16px 16px', 
            gap: 8, 
            background: 'var(--ion-toolbar-background, var(--ion-background-color, #fff))' 
          }}
        >
          <IonButton 
            size="small" 
            fill={priceRange[0] !== minAvailable || priceRange[1] !== maxAvailable ? "solid" : "outline"}
            onClick={() => setShowFilter(true)}
            style={{ '--border-radius': '20px', height: '32px', margin: 0, fontWeight: 600, fontSize: '12px', flexShrink: 0 }}
          >
            Price Range { (priceRange[0] !== minAvailable || priceRange[1] !== maxAvailable) && '•' }
          </IonButton>

          {[
            { label: 'Under ₹5k', range: [0, 5000] },
            { label: '₹5k - ₹20k', range: [5000, 20000] },
            { label: 'Above ₹20k', range: [20000, maxAvailable] }
          ].map(p => {
             const isActive = priceRange[0] === p.range[0] && priceRange[1] === p.range[1];
             return (
               <IonButton 
                 key={p.label}
                 size="small" 
                 fill={isActive ? "solid" : "outline"}
                 color="medium"
                 onClick={() => setPriceRange([p.range[0], p.range[1]])}
                 style={{ '--border-radius': '20px', height: '32px', margin: 0, fontWeight: 500, fontSize: '11px', flexShrink: 0 }}
               >
                 {p.label}
               </IonButton>
             );
          })}

          <IonButton 
            size="small" 
            fill={selectedColors.length > 0 ? "solid" : "outline"}
            onClick={() => setShowFilter(true)}
            style={{ '--border-radius': '20px', height: '32px', margin: 0, fontWeight: 600, fontSize: '12px', flexShrink: 0 }}
          >
            Colors { selectedColors.length > 0 && `(${selectedColors.length})` }
          </IonButton>
        </div>
      </IonHeader>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <IonContent>
        <IonModal isOpen={showAuth} onDidDismiss={() => setShowAuth(false)}>
          <div style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Login key={authKey} />
          </div>
        </IonModal>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#666' }}>{filteredAndSorted.length} products found</div>
            <IonItem lines="none" style={{ '--background': 'transparent', width: 160 }}>
              <IonSelect 
                value={sortBy} 
                onIonChange={e => setSortBy(e.detail.value)} 
                interface="popover"
                style={{ fontSize: 14 }}
              >
                <IonSelectOption value="default">Sort by</IonSelectOption>
                <IonSelectOption value="price-low">Price: Low to High</IonSelectOption>
                <IonSelectOption value="price-high">Price: High to Low</IonSelectOption>
                <IonSelectOption value="rating">Top Rated</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          <IonGrid className="ion-no-padding">
            <IonRow style={{ margin: '-8px' }}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <IonCol size="6" sizeMd="4" sizeLg="3" key={i} style={{ padding: 8 }}>
                    <IonSkeletonText animated style={{ width: '100%', height: 260, borderRadius: 16 }} />
                  </IonCol>
                ))
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map(p => (
                  <IonCol size="6" sizeMd="4" sizeLg="3" key={p.id} style={{ padding: 8 }}>
                    {renderProductCard(p)}
                  </IonCol>
                ))
              ) : (
                <IonCol size="12" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛋️</div>
                  <h3 style={{ fontWeight: 600 }}>No matching pieces</h3>
                  <p style={{ color: '#888' }}>Try adjusting your filters or search terms.</p>
                  <IonButton fill="outline" onClick={clearFilters} style={{ marginTop: 16 }}>Clear all filters</IonButton>
                </IonCol>
              )}
            </IonRow>
          </IonGrid>
        </div>

        {/* Filter Modal */}
        <IonModal isOpen={showFilter} onDidDismiss={() => setShowFilter(false)} breakpoints={[0, 0.7, 0.9]} initialBreakpoint={0.7}>
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle style={{ fontWeight: 600 }}>Refine Selection</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowFilter(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent style={{ '--background': '#f9f9f9' }}>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px', fontWeight: 700 }}>Price Range</h4>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ flex: 1, padding: '10px 14px', background: '#fff', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Min Price</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#333', marginRight: 4 }}>₹</span>
                      <input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={e => {
                          const val = Math.min(Number(e.target.value), priceRange[1]);
                          setPriceRange([val, priceRange[1]]);
                        }}
                        style={{ border: 'none', width: '100%', outline: 'none', fontSize: 15, fontWeight: 600, background: 'transparent', color: '#000' }}
                      />
                    </div>
                  </div>
                  <div style={{ color: '#ddd' }}>—</div>
                  <div style={{ flex: 1, padding: '10px 14px', background: '#fff', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Max Price</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#333', marginRight: 4 }}>₹</span>
                      <input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={e => {
                          const val = Math.max(Number(e.target.value), priceRange[0]);
                          setPriceRange([priceRange[0], Math.min(val, maxAvailable)]);
                        }}
                        style={{ border: 'none', width: '100%', outline: 'none', fontSize: 15, fontWeight: 600, background: 'transparent', color: '#000' }}
                      />
                    </div>
                  </div>
                </div>
                <IonRange
                  min={minAvailable}
                  max={maxAvailable}
                  dualKnobs
                  pin
                  value={{ lower: priceRange[0], upper: priceRange[1] }}
                  onIonInput={e => {
                    const val = e.detail.value as { lower: number, upper: number };
                    setPriceRange([val.lower, val.upper]);
                  }}
                  style={{ '--bar-background': '#e0e0e0', '--bar-background-active': '#007bff', padding: '0 8px' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 16, fontWeight: 700 }}>Colors</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {colorOptions.map(c => {
                    const isSelected = selectedColors.includes(c);
                    return (
                      <div
                        key={c}
                        onClick={() => setSelectedColors(prev => isSelected ? prev.filter(x => x !== c) : [...prev, c])}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          backgroundColor: isSelected ? '#000' : '#fff',
                          color: isSelected ? '#fff' : '#444',
                          border: `1px solid ${isSelected ? '#000' : '#ddd'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                <IonButton expand="block" fill="clear" color="medium" style={{ flex: 1 }} onClick={clearFilters}>
                  <IonIcon icon={trashOutline} slot="start" />
                  Reset
                </IonButton>
                <IonButton expand="block" style={{ flex: 2, '--border-radius': '12px' }} onClick={() => setShowFilter(false)}>
                  Apply Filters
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <style>{`
          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 32px rgba(0,0,0,0.1) !important;
          }
          .product-card:hover .product-img {
            transform: scale(1.05);
          }
          .btn-view:hover {
            background: #e0e0e0 !important;
          }
          .btn-buy:hover {
            background: #333 !important;
          }
          ion-searchbar .searchbar-input-container {
            box-shadow: none !important;
          }
          ion-range::part(knob) {
            background: #fff;
            border: 2px solid #007bff;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default Products;
