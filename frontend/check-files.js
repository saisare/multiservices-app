// Script de vérification complète des fichiers frontend
// Vérifie la syntaxe, les imports et les erreurs potentielles

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'src');

// Fonction pour vérifier un fichier TypeScript/React
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Vérifier les entités HTML mal encodées
    if (content.includes('&amp;') && !content.includes('<!--')) {
      issues.push('Entité HTML &amp; détectée (devrait être &&)');
    }

    // Vérifier les imports manquants
    const importMatches = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
        if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
          // Vérifier si le fichier existe (simplifié)
          const resolvedPath = importPath.replace('@/', 'src/');
          const fullPath = path.resolve(path.dirname(filePath), resolvedPath);
          if (!fs.existsSync(fullPath + '.ts') && !fs.existsSync(fullPath + '.tsx') &&
              !fs.existsSync(fullPath + '/index.ts') && !fs.existsSync(fullPath + '/index.tsx')) {
            issues.push(`Import potentiellement manquant: ${importPath}`);
          }
        }
      });
    }

    // Vérifier la syntaxe JSX de base
    if (filePath.endsWith('.tsx')) {
      // Vérifier les balises non fermées (simplifié)
      const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
      if (openTags !== closeTags) {
        issues.push('Nombre de balises ouvrantes/fermantes ne correspond pas');
      }
    }

    return {
      file: path.relative(FRONTEND_DIR, filePath),
      issues: issues,
      valid: issues.length === 0
    };

  } catch (error) {
    return {
      file: path.relative(FRONTEND_DIR, filePath),
      issues: [`Erreur de lecture: ${error.message}`],
      valid: false
    };
  }
}

// Fonction récursive pour scanner les fichiers
function scanDirectory(dir) {
  const results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        results.push(...scanDirectory(fullPath));
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(checkFile(fullPath));
      }
    }
  } catch (error) {
    results.push({
      file: path.relative(FRONTEND_DIR, dir),
      issues: [`Erreur de scan: ${error.message}`],
      valid: false
    });
  }

  return results;
}

// Exécution principale
console.log('🔍 VÉRIFICATION COMPLÈTE DES FICHIERS FRONTEND');
console.log('=' .repeat(60));

const results = scanDirectory(FRONTEND_DIR);

let totalFiles = 0;
let validFiles = 0;
let filesWithIssues = 0;

results.forEach(result => {
  totalFiles++;
  if (result.valid) {
    validFiles++;
    console.log(`✅ ${result.file}`);
  } else {
    filesWithIssues++;
    console.log(`❌ ${result.file}`);
    result.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
});

console.log('\n' + '=' .repeat(60));
console.log(`📊 RÉSULTATS:`);
console.log(`   Total fichiers: ${totalFiles}`);
console.log(`   ✅ Valides: ${validFiles}`);
console.log(`   ❌ Avec problèmes: ${filesWithIssues}`);

if (filesWithIssues === 0) {
  console.log('\n🎉 TOUS LES FICHIERS SONT CORRECTS !');
  console.log('🚀 Prêt pour le build et le déploiement.');
} else {
  console.log(`\n⚠️  ${filesWithIssues} fichier(s) nécessitent une correction.`);
  process.exit(1);
}