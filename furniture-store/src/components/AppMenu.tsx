import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonMenuToggle,
  IonAvatar,
  IonText,
  IonFooter,
  IonButton
} from '@ionic/react';
import { 
  homeOutline, 
  listOutline, 
  cartOutline, 
  personOutline, 
  logInOutline, 
  logOutOutline,
  heartOutline,
  settingsOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useAuth } from '../utils/AuthContext';
import { useHistory } from 'react-router-dom';

const AppMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonMenu contentId="main-content" side="start" type="overlay">
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary" style={{ padding: '20px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <IonAvatar style={{ width: '50px', height: '50px', border: '2px solid white' }}>
              <img 
                src={isAuthenticated && user 
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=3a7bd5&size=128` 
                  : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                alt="user" 
              />
            </IonAvatar>
            <div>
              <IonTitle style={{ padding: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {isAuthenticated && user ? user.name : 'Guest User'}
              </IonTitle>
              {isAuthenticated ? (
                <IonText color="light" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {user?.email}
                </IonText>
              ) : (
                <IonButton 
                  fill="clear" 
                  size="small" 
                  style={{ '--color': 'white', padding: 0, height: '20px', fontSize: '0.8rem', textTransform: 'none' }}
                  onClick={() => { history.push('/login'); }}
                >
                  Sign in to your account
                  <IonIcon slot="end" icon={chevronForwardOutline} />
                </IonButton>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="none" style={{ background: 'transparent', padding: '10px' }}>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/home" detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
              <IonIcon icon={homeOutline} slot="start" color="primary" />
              <IonText style={{ fontWeight: '500' }}>Home</IonText>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/products" detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
              <IonIcon icon={listOutline} slot="start" color="primary" />
              <IonText style={{ fontWeight: '500' }}>Explore Products</IonText>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/cart" detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
              <IonIcon icon={cartOutline} slot="start" color="primary" />
              <IonText style={{ fontWeight: '500' }}>My Shopping Cart</IonText>
            </IonItem>
          </IonMenuToggle>
          
          <div style={{ borderTop: '1px solid #eee', margin: '15px 10px' }}></div>
          
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/profile" detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
              <IonIcon icon={personOutline} slot="start" color="secondary" />
              <IonText style={{ fontWeight: '500' }}>{isAuthenticated ? 'Account Profile' : 'Guest Profile'}</IonText>
            </IonItem>
          </IonMenuToggle>

          {!isAuthenticated && (
            <IonMenuToggle autoHide={false}>
              <IonItem button routerLink="/login" detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
                <IonIcon icon={logInOutline} slot="start" color="primary" />
                <IonText style={{ fontWeight: '500' }}>Sign In</IonText>
              </IonItem>
            </IonMenuToggle>
          )}

          {isAuthenticated && (
            <IonMenuToggle autoHide={false}>
              <IonItem button detail={false} className="menu-item" style={{ '--border-radius': '10px', marginBottom: '5px' }}>
                <IonIcon icon={heartOutline} slot="start" color="secondary" />
                <IonText style={{ fontWeight: '500' }}>Wishlist</IonText>
              </IonItem>
            </IonMenuToggle>
          )}
        </IonList>
      </IonContent>
      <IonFooter className="ion-no-border">
         {isAuthenticated && (
           <div style={{ padding: '20px' }}>
             <IonButton expand="block" fill="outline" color="danger" onClick={handleLogout} style={{ '--border-radius': '10px' }}>
               <IonIcon icon={logOutOutline} slot="start" />
               Logout
             </IonButton>
           </div>
         )}
         <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
            <IonText color="medium" style={{ fontSize: '0.75rem' }}>Furniture Store v1.0.4</IonText>
         </div>
      </IonFooter>
    </IonMenu>
  );
};

export default AppMenu;
