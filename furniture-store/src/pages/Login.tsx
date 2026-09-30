import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage,  
  IonInput, 
  IonButton, 
  IonItem, 
  IonLabel, 
  IonText, 
  IonIcon,
  IonLoading,
  IonToast,
  IonButtons,
  IonBackButton,
  IonHeader,
  IonToolbar
} from '@ionic/react';
import { mailOutline, lockClosedOutline, arrowForwardOutline, homeOutline } from 'ionicons/icons';
import { useAuth } from '../utils/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import './Login.css';

type LoginProps = {
  redirectTo?: string;
  onSuccess?: () => void;
};

const Login: React.FC<LoginProps> = ({ redirectTo, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = redirectTo || queryParams.get('redirect') || '/profile';

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(redirectPath);
      if (onSuccess) onSuccess();
    }
  }, [isAuthenticated, history, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToastMessage('Please enter both email and password');
      setShowToast(true);
      return;
    }

    try {
      await login(email, password);
      history.push(redirectPath);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setToastMessage(err.message || 'Login failed. Please try again.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content-wrapper">
        <div className="login-bg-overlay"></div>
        
        <IonHeader className="ion-no-border login-header">
          <IonToolbar style={{ '--background': 'transparent' }}>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" color="light" />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => history.push('/home')} color="light">
                <IonIcon slot="icon-only" icon={homeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="login-flex-container">
          <div className="login-branding">
            <h1>Furniture<span>Store</span></h1>
            <p>Elegance in every corner. Sign in to continue your journey.</p>
          </div>

          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome Back</h2>
              <p>Please enter your details to sign in</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <IonLabel className="custom-label">Email Address</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={mailOutline} />
                  <IonInput 
                    type="email" 
                    value={email} 
                    onIonChange={e => setEmail(e.detail.value!)} 
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <IonLabel className="custom-label">Password</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={lockClosedOutline} />
                  <IonInput 
                    type="password" 
                    value={password} 
                    onIonChange={e => setPassword(e.detail.value!)} 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="login-options">
                <IonText color="medium">
                  <span>Forgot Password?</span>
                </IonText>
              </div>

              <IonButton expand="block" type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
                <IonIcon icon={arrowForwardOutline} slot="end" />
              </IonButton>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <span className="register-link" onClick={() => history.push('/register')}>Register</span></p>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Authenticating..." spinner="crescent" />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
          position="top"
          className="custom-toast"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
