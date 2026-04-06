const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'auth_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ Erreur connexion:', err);
        process.exit(1);
    }
    console.log('✅ Connecté à MySQL');
    fixPasswords();
});

async function fixPasswords() {
    // Récupérer tous les utilisateurs
    db.query('SELECT id, email, password_hash FROM users', async (err, results) => {
        if (err) {
            console.error('❌ Erreur requête:', err);
            db.end();
            process.exit(1);
        }

        console.log(`\n📋 ${results.length} utilisateurs trouvés\n`);
        let updated = 0;
        let skipped = 0;

        for (const user of results) {
            // Vérifier si c'est déjà du bcrypt
            if (user.password_hash.startsWith('$2')) {
                console.log(`⏭️  ${user.email} - déjà hashé en bcrypt`);
                skipped++;
                continue;
            }

            // Hasher le mot de passe en clair
            const hashed = await bcrypt.hash(user.password_hash, 10);
            
            db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, user.id], (err) => {
                if (err) {
                    console.error(`❌ Erreur pour ${user.email}:`, err.message);
                } else {
                    updated++;
                    console.log(`✅ ${user.email} - mot de passe hashé`);
                }
            });
        }

        // Attendre un peu et fermer
        setTimeout(() => {
            console.log(`\n📊 Résultat: ${updated} mots de passe conversion, ${skipped} déjà hashés`);
            db.end();
            process.exit(0);
        }, 1500);
    });
}
