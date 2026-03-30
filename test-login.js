const http = require('http');

function makeRequest(path, data) {
    return new Promise((resolve) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ error: err.message });
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 TEST DE CONNEXION');
    console.log('====================\n');

    // Test 1: Health check
    console.log('Test 1: Vérifier si auth-service répond...');
    try {
        const health = await makeRequest('/health', {});
        console.log('✅ Auth service répond:', health.status, '\n');
    } catch (e) {
        console.log('❌ Auth service not responding\n');
    }

    // Test 2: Login jean.martin
    console.log('Test 2: Connexion jean.martin@blg-engineering.com / Junior2@');
    const res1 = await makeRequest('/api/auth/login', {
        email: 'jean.martin@blg-engineering.com',
        password: 'Junior2@',
        departement: 'btp'
    });
    console.log(`Status: ${res1.status}`);
    if (res1.data.success) {
        console.log('✅ SUCCÈS - Token reçu');
        console.log(`   User: ${res1.data.user.email}`);
        console.log(`   Département: ${res1.data.user.departement}\n`);
    } else {
        console.log('❌ ÉCHEC:', res1.data.error, '\n');
    }

    // Test 3: Login junior
    console.log('Test 3: Connexion juniornossi1@gmail.com / junior23@');
    const res2 = await makeRequest('/api/auth/login', {
        email: 'juniornossi1@gmail.com',
        password: 'junior23@',
        departement: 'btp'
    });
    console.log(`Status: ${res2.status}`);
    if (res2.data.success) {
        console.log('✅ SUCCÈS - Token reçu');
        console.log(`   User: ${res2.data.user.email}`);
        console.log(`   Département: ${res2.data.user.departement}\n`);
    } else {
        console.log('❌ ÉCHEC:', res2.data.error, '\n');
    }

    // Test 4: Admin login
    console.log('Test 4: Connexion admin nossijunior23@gmail.com');
    const res3 = await makeRequest('/api/auth/login', {
        email: 'nossijunior23@gmail.com',
        password: 'Nossi@2024',
        departement: 'pdg'
    });
    console.log(`Status: ${res3.status}`);
    if (res3.data.success) {
        console.log('✅ SUCCÈS - Token reçu');
        console.log(`   User: ${res3.data.user.email}`);
        console.log(`   Role: ${res3.data.user.role}\n`);
    } else {
        console.log('❌ ÉCHEC:', res3.data.error, '\n');
    }

    console.log('✅ Tests terminés');
}

runTests();
