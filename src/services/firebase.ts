import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(config) : getApp();

// Initialize Auth & Firestore with custom Database ID
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId || undefined);

export const googleProvider = new GoogleAuthProvider();
// Request standard profile & email scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Creates or updates user record in Firestore `users` collection
 */
export async function syncUserProfile(user: User) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email?.toLowerCase() || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Traveler',
      photoURL: user.photoURL || '',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      tripsCreatedThisMonth: 0,
      createdAt: new Date().toISOString()
    });
  } else {
    // update photo or display name if changed
    await setDoc(userRef, {
      photoURL: user.photoURL || snap.data().photoURL || '',
      displayName: user.displayName || snap.data().displayName || '',
      email: user.email?.toLowerCase() || snap.data().email || '',
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  }
}

/**
 * Sign in with Google Popup (Gmail)
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await syncUserProfile(result.user);
  }
  return result.user;
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email: string, pass: string, name?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, {
      uid: result.user.uid,
      email: result.user.email?.toLowerCase() || email.toLowerCase(),
      displayName: name || email.split('@')[0],
      photoURL: '',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      tripsCreatedThisMonth: 0,
      createdAt: new Date().toISOString()
    });
  }
  return result.user;
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  await firebaseSignOut(auth);
}
