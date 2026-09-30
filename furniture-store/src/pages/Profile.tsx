import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton, 
  IonIcon, 
  IonButtons, 
  IonMenuButton, 
  IonAvatar, 
  IonItem, 
  IonLabel, 
  IonList, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonListHeader
} from '@ionic/react';
import { 
  logOutOutline, 
  personCircleOutline, 
  mailOutline, 
  shieldCheckmarkOutline, 
  chevronForwardOutline, 
  cartOutline, 
  settingsOutline, 
  heartOutline,
  logInOutline,
  helpCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../utils/AuthContext';
import { useHistory } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonText>Loading profile...</IonText>
        </IonContent>
      </IonPage>
    );
  }

  // Guest State View
  if (!isAuthenticated || !user) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="profile-content">
          <div className="profile-header-bg"></div>
          <div className="profile-container">
            <div className="profile-card-wrapper">
              <IonCard className="profile-card">
                <div className="profile-avatar-container">
                  <IonAvatar className="profile-avatar">
                     <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Guest" />
                  </IonAvatar>
                </div>
                <IonCardHeader className="ion-text-center">
                  <IonCardTitle className="profile-name">Guest User</IonCardTitle>
                  <p className="profile-role-badge">Unauthenticated</p>
                </IonCardHeader>
                <div className="ion-padding ion-text-center">
                  <IonText color="medium">
                    <p>Log in to track your orders, save items to your wishlist, and manage your account.</p>
                  </IonText>
                  <IonButton expand="block" mode="ios" className="login-now-btn" onClick={() => history.push('/login')}>
                    <IonIcon icon={logInOutline} slot="start" />
                    Sign In Now
                  </IonButton>
                </div>
              </IonCard>
            </div>

            <IonList lines="none" className="profile-list ion-margin-top">
              <IonListHeader>
                <IonLabel>Support & More</IonLabel>
              </IonListHeader>
              <IonItem className="profile-list-item" button>
                <IonIcon icon={helpCircleOutline} slot="start" color="primary" />
                <IonLabel>Help Center</IonLabel>
              </IonItem>
              <IonItem className="profile-list-item" button>
                <IonIcon icon={settingsOutline} slot="start" color="medium" />
                <IonLabel>App Settings</IonLabel>
              </IonItem>
            </IonList>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Logged In User View
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} color="danger">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="profile-content">
        <div className="profile-header-bg"></div>
        <div className="profile-container">
          <div className="profile-card-wrapper">
            <IonCard className="profile-card">
              <div className="profile-avatar-container">
                <IonAvatar className="profile-avatar">
                   <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`} alt={user.name} />
                </IonAvatar>
              </div>
              <IonCardHeader className="ion-text-center">
                <IonCardTitle className="profile-name">{user.name}</IonCardTitle>
                <p className="profile-role-badge">{user.role ?? 'Member'}</p>
              </IonCardHeader>

              <div className="profile-stats">
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <div className="stat-item">
                        <IonIcon icon={cartOutline} />
                        <span>12 Orders</span>
                      </div>
                    </IonCol>
                    <IonCol>
                      <div className="stat-item">
                        <IonIcon icon={heartOutline} />
                        <span>8 Wishlist</span>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            </IonCard>
          </div>

          <IonList lines="none" className="profile-list ion-margin-top">
            <IonListHeader>
              <IonLabel>Account Information</IonLabel>
            </IonListHeader>
            <IonItem className="profile-list-item">
              <IonIcon icon={mailOutline} slot="start" color="primary" />
              <IonLabel>
                <p>Email Address</p>
                <h3>{user.email}</h3>
              </IonLabel>
            </IonItem>
            
            <IonItem className="profile-list-item">
              <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
              <IonLabel>
                <p>Member Since</p>
                <h3>{new Date(user.createdAt).toLocaleDateString()}</h3>
              </IonLabel>
            </IonItem>

            <IonListHeader className="ion-margin-top">
              <IonLabel>Settings & Preferences</IonLabel>
            </IonListHeader>
            <IonItem className="profile-list-item" button detail={true} detailIcon={chevronForwardOutline}>
              <IonIcon icon={personCircleOutline} slot="start" color="secondary" />
              <IonLabel>Edit Profile</IonLabel>
            </IonItem>
            <IonItem className="profile-list-item" button detail={true} detailIcon={chevronForwardOutline}>
              <IonIcon icon={settingsOutline} slot="start" color="medium" />
              <IonLabel>Account Settings</IonLabel>
            </IonItem>
          </IonList>

          <div className="ion-padding">
             <IonButton expand="block" mode="ios" color="danger" className="logout-btn" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="start" />
                Sign Out
             </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
