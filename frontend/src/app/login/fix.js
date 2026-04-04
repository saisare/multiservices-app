const fs = require('fs');
const content = fs.readFileSync('page.tsx', 'utf8');

const oldCode = `      if (role === 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('departement');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        console.log('➡️ Redirecting admin to dedicated entry /admin');
        router.push(`/admin?notice=use-dedicated-access&email=${encodeURIComponent(email)}`);\n      } else if`;

const newCode = `      if (role === 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('departement');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        console.log('➡️ Admin detection - use /admin-login portal');
        setError('❌ Les administrateurs doivent utiliser le portail dédié. Redirection...');
        setTimeout(() => {
          router.push(`/admin-login?notice=use-admin-portal&email=${encodeURIComponent(email)}`);
        }, 2000);
      } else if`;

const fixed = content.replace(oldCode, newCode);
fs.writeFileSync('page.tsx', fixed, 'utf8');
console.log('✅ Fixed admin redirect in login!');
