import React, { useState } from 'react';
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
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { mailOutline, lockClosedOutline, personOutline, arrowForwardOutline } from 'ionicons/icons';
import { useAuth } from '../utils/AuthContext';
import { useHistory } from 'react-router-dom';
import './Register.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { register, loading } = useAuth();
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const tName = name.trim();
    const tEmail = email.trim();
    const tPassword = password.trim();
    const tConfirm = confirm.trim();

    if (!tName || !tEmail || !tPassword) {
      setToastMessage('Please complete all fields');
      setShowToast(true);
      return;
    }
    if (tPassword !== tConfirm) {
      setToastMessage('Passwords do not match');
      setShowToast(true);
      return;
    }

    try {
      await register(name, email, password);
      history.replace('/profile');
    } catch (err: any) {
      setToastMessage(err.message || 'Registration failed');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="register-content-wrapper">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'transparent' }}>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/login" color="light" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="register-flex-container">
          <div className="register-card">
            <div className="register-card-header">
              <h2>Create Account</h2>
              <p>Register to get started with FurnitureStore</p>
            </div>

            <form onSubmit={handleRegister} className="register-form">
              <div className="input-group">
                <IonLabel className="custom-label">Full Name</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={personOutline} />
                  <IonInput type="text" value={name} onIonChange={e => setName(e.detail.value ?? '')} placeholder="John Doe" required />
                </div>
              </div>

              <div className="input-group">
                <IonLabel className="custom-label">Email Address</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={mailOutline} />
                  <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value ?? '')} placeholder="john@example.com" required />
                </div>
              </div>

              <div className="input-group">
                <IonLabel className="custom-label">Password</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={lockClosedOutline} />
                  <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value ?? '')} placeholder="••••••••" required />
                </div>
              </div>

              <div className="input-group">
                <IonLabel className="custom-label">Confirm Password</IonLabel>
                <div className="custom-input-item">
                  <IonIcon icon={lockClosedOutline} />
                  <IonInput type="password" value={confirm} onIonChange={e => setConfirm(e.detail.value ?? '')} placeholder="••••••••" required />
                </div>
              </div>

              <IonButton expand="block" type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
                <IonIcon icon={arrowForwardOutline} slot="end" />
              </IonButton>
            </form>

            <div className="register-footer">
              <p>Already have an account? <span className="login-link" onClick={() => history.push('/login')}>Sign in</span></p>
            </div>

          </div>
        </div>

        <IonLoading isOpen={loading} message="Registering..." spinner="crescent" />
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

export default Register;
