/* Cloud details for the portfolio. Firebase is the same project your "Our Story" diary uses.
   Cloudinary: cloud name + unsigned upload preset. Never put your Cloudinary API secret anywhere in this site. */
window.CLOUD = {
  firebase: {
    apiKey: 'AIzaSyBuEwcRLAMiDMTYM3IqQ4-8tyEaORA-dMM',
    authDomain: 'sheandme-d9d39.firebaseapp.com',
    projectId: 'sheandme-d9d39',
    storageBucket: 'sheandme-d9d39.firebasestorage.app',
    messagingSenderId: '904099472126',
    appId: '1:904099472126:web:12bbf0d52991edcd7fbbaf'
  },
  cloudinary: { cloudName: 'dxe1rbdud', uploadPreset: 'portfolio_unsigned' },   // unsigned preset (no API key or secret needed in the browser)
  adminEmail: 'ishaan8862@gmail.com',                // your Manager login
  doc: 'portfolio/content'                           // where the portfolio is stored in Firestore
};
