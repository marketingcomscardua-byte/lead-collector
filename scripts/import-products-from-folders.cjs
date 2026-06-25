/**
 * import-products-from-folders.cjs
 *
 * Lê as pastas do Google Drive (Comercial Scardua + Porto Livre),
 * extrai nomes de subpastas que representam produtos e gera
 * public/importedProducts.json
 *
 * Uso:
 *   node scripts/import-products-from-folders.cjs
 *   (ou: npm run import:products)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ============================================================
// CONFIGURAÇÃO — raízes de cada linha/empresa
// ============================================================
const ROOTS = [
  {
    folderPath: 'Z:\\Meu Drive\\Marketing\\. COMERCIAL SCARDUA - Drive do Consultor\\02 - CONTEÚDO E MARKETING\\02 - Fotos e Vídeos\\01 - Linha Agricola',
    line: 'Linha Agrícola',
    company: 'Comercial Scardua',
    sourceRoot: 'Comercial Scardua - Linha Agrícola',
    mode: 'scardua',    // estrutura com grupos intermediários
  },
  {
    folderPath: 'Z:\\Meu Drive\\Marketing\\. COMERCIAL SCARDUA - Drive do Consultor\\02 - CONTEÚDO E MARKETING\\02 - Fotos e Vídeos\\02 - Linha Amarela',
    line: 'Linha Amarela',
    company: 'Comercial Scardua',
    sourceRoot: 'Comercial Scardua - Linha Amarela',
    mode: 'flat',       // produtos direto na raiz
  },
  {
    folderPath: 'Z:\\Meu Drive\\Marketing\\. PORTO LIVRE - Drive do Consultor\\02 - CONTEÚDO E MARKETING\\02 - Fotos e Vídeos',
    line: null,           // linha detectada dinamicamente
    company: 'PORTO LIVRE',
    sourceRoot: 'Porto Livre - Fotos e Vídeos',
    mode: 'porto',      // sublinhas são linhas reais (ex: "02 - Linha Amarela")
  },
];

const MAX_DEPTH = 4;

// ============================================================
// HELPERS
// ============================================================

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeKey(str) {
  return removeAccents(str).toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Remove prefixo numérico: "01 - Nome"  →  "Nome" */
function stripNumericPrefix(name) {
  return name.replace(/^\s*\d+\s*[-–.]\s*/u, '').replace(/\s+/g, ' ').trim();
}

// ---- Pastas genéricas a ignorar (comparação normalizada) ----
const GENERIC_NAMES = new Set([
  // engajamento
  '00 - conteudos de engajamento',
  '00 - conteudo de engajamento',
  'conteudos de engajamento',
  'conteudo de engajamento',
  // media
  'fotos', 'videos', 'imagens', 'thumbs',
  'capas', 'stories', 'reels', 'posts',
  '01. fotos', '02. videos', '03. depoimentos',
  '01 - fotos', '02 - videos', '03 - depoimentos',
  '01- fotos', '02 - videos', '1. fotos', '2. videos',
  '03. depoimentos', '3. depoimentos',
  // organizacional / institucional
  'institucional', 'catalogo', 'catalogos',
  'diversos', 'outros', 'materiais', 'templates',
  'campanhas', 'eventos', 'equipe', 'treinamento',
]);

// Pastas que, se aparecerem em qualquer parte do caminho, descartam o item inteiro
const BLOCKLIST_PATH_PARTS = new Set([
  'lojas', 'loja',
]);

// Grupos intermediários de categoria (não são produtos)
const CATEGORY_GROUPS = new Set([
  'tratores e micro tratores',
  'transportadores',
  'colhedoras',
  'implementos agricolas e produtos diversos',
]);

/** Verifica se o nome da pasta é genérico e deve ser ignorado */
function isGenericFolder(rawName) {
  const key = normalizeKey(rawName);
  const stripped = normalizeKey(stripNumericPrefix(rawName));
  if (GENERIC_NAMES.has(key) || GENERIC_NAMES.has(stripped)) return true;
  // Prefixo 00 = conteúdo de engajamento
  if (/^\s*00\s*[-–.]/u.test(rawName)) return true;
  // Sub-pastas de produto: "01. Fotos", "02. Vídeos", etc.
  if (/^0?\d[.-]\s*(fotos?|v[íi]deos?|depoimentos?)/iu.test(rawName)) return true;
  return false;
}

/** Verifica se o caminho completo deve ser bloqueado (ex: contém "Lojas") */
function isBlockedPath(fullPath) {
  const parts = fullPath.split(/[\\/]+/).map(p => normalizeKey(stripNumericPrefix(p)));
  return parts.some(p => BLOCKLIST_PATH_PARTS.has(p));
}

function isCategoryGroup(stripped) {
  return CATEGORY_GROUPS.has(normalizeKey(stripped));
}

// ---- Detecção de Linha ----
function detectLineFromPath(pathStr, explicitLine) {
  if (explicitLine) return explicitLine;
  const n = normalizeKey(pathStr);
  if (/linha.?amarela/.test(n))        return 'Linha Amarela';
  if (/linha.?agricola/.test(n))       return 'Linha Agrícola';
  if (/nautica|nautico|marine/.test(n)) return 'Linha Náutica';
  if (/linha.?ep|empilhadeira/.test(n)) return 'Linha EP';
  return 'Porto Livre';
}

// ---- Classificação do Produto (Regras Oficiais) ----
function classifyProduct(name, company, sourcePath) {
  const pathStr = String(sourcePath || "");
  const companyStr = String(company || "");
  
  const normalized = normalizeKey(name + " " + pathStr + " " + companyStr);
  const normalizedName = normalizeKey(name);

  // 1. Determine Brand & Company
  let brand = "Outras";
  let companyName = "Sem Empresa";

  // Check Lovol
  if (normalized.includes("lovol") || /^fr/i.test(name.trim()) || /^fl/i.test(name.trim())) {
    brand = "Lovol";
    companyName = "PORTO LIVRE";
  }
  // Check Sunward
  else if (normalized.includes("sunward") || /^sw[a-z0-9-]*/i.test(name.trim())) {
    brand = "Sunward";
    companyName = "Comercial Scardua";
  }
  // Check EP Equipment
  else if (
    normalized.includes("ep equipment") ||
    normalized.includes("ep equip") ||
    normalized.includes("empilhadeira") ||
    normalized.includes("empilhadeiras") ||
    normalized.includes("transpaleteira") ||
    normalized.includes("transpaleteiras") ||
    normalized.includes("paleteira") ||
    normalized.includes("paleteiras")
  ) {
    brand = "EP Equipment";
    companyName = "PORTO LIVRE";
  }
  // Check Agritech
  else if (normalized.includes("agritech")) {
    brand = "Agritech";
    companyName = "Comercial Scardua";
  }
  // Other known brands
  else if (normalized.includes("moldemaq")) {
    brand = "Moldemaq";
    companyName = company || "Comercial Scardua";
  } else if (normalized.includes("yto")) {
    brand = "YTO";
    companyName = company || "PORTO LIVRE";
  } else if (normalized.includes("barbieri")) {
    brand = "Barbieri";
    companyName = company || "Comercial Scardua";
  } else if (normalized.includes("mercury")) {
    brand = "Mercury";
    companyName = company || "PORTO LIVRE";
  } else if (normalized.includes("fibrafort")) {
    brand = "Fibrafort";
    companyName = company || "PORTO LIVRE";
  } else if (normalized.includes("ventura")) {
    brand = "Ventura";
    companyName = company || "PORTO LIVRE";
  } else if (normalized.includes("comercial scardua")) {
    brand = "Comercial Scardua";
    companyName = "Comercial Scardua";
  } else if (normalized.includes("porto livre")) {
    brand = "Porto Livre";
    companyName = "PORTO LIVRE";
  } else {
    // Fallback companyName based on path
    const pathNorm = normalizeKey(pathStr);
    const companyNorm = normalizeKey(companyStr);

    if (pathNorm.includes("comercial scardua") || companyNorm.includes("comercial scardua")) {
      companyName = "Comercial Scardua";
    } else if (pathNorm.includes("porto livre") || companyNorm.includes("porto livre")) {
      companyName = "PORTO LIVRE";
    } else if (company) {
      companyName = company;
    }
  }

  // 2. Determine Category (Strict list)
  let category = "Outros";

  // Check Agritech
  if (normalizedName.includes("microtrator") || normalizedName.includes("micro trator")) {
    category = "Microtrator";
  } else if (normalizedName.includes("trator")) {
    category = "Trator";
  }
  // Check Transportador agrícola
  else if (
    normalizedName.includes("transportador agricola") ||
    normalizedName.includes("transportador")
  ) {
    category = "Transportador Agrícola";
  }
  // Check Sunward / Lovol / Linha Amarela
  else if (normalizedName.includes("mini escavadeira") || normalizedName.includes("miniescavadeira")) {
    category = "Mini Escavadeira";
  } else if (normalizedName.includes("escavadeira")) {
    category = "Escavadeira";
  } else if (
    normalizedName.includes("pa carregadeira") ||
    normalizedName.includes("carregadeira")
  ) {
    category = "Pá Carregadeira";
  }
  // Check Lovol por prefixo
  else if (/^fr/i.test(name.trim())) {
    category = "Escavadeira";
  } else if (/^fl/i.test(name.trim())) {
    category = "Pá Carregadeira";
  }
  // Check EP Equipment
  else if (normalizedName.includes("empilhadeira") || normalizedName.includes("empilhadeiras")) {
    category = "Empilhadeira";
  } else if (
    normalizedName.includes("transpaleteira") ||
    normalizedName.includes("transpaleteiras") ||
    normalizedName.includes("paleteira") ||
    normalizedName.includes("paleteiras")
  ) {
    category = "Transpaleteira";
  }
  // Check Peças e Serviço
  else if (
    normalizedName.includes("peca") ||
    normalizedName.includes("pecas")
  ) {
    category = "Peças";
  } else if (
    normalizedName.includes("servico") ||
    normalizedName.includes("servicos") ||
    normalizedName.includes("manutencao")
  ) {
    category = "Serviço";
  }

  return {
    brand,
    companyName,
    category
  };
}

// ============================================================
// LEITURA RECURSIVA — modo SCARDUA (grupos intermediários)
// ============================================================
function scanScardua(folderPath, line, company, sourceRoot, depth, products, seenKeys) {
  if (depth > MAX_DEPTH) return;
  if (isBlockedPath(folderPath)) return;

  let entries;
  try { entries = fs.readdirSync(folderPath, { withFileTypes: true }); }
  catch (err) { console.warn(`  ⚠️  Não foi possível ler: ${folderPath}\n     ${err.message}`); return; }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const rawName  = entry.name;
    const fullPath = path.join(folderPath, rawName);

    if (isBlockedPath(fullPath)) continue;
    if (isGenericFolder(rawName)) continue;

    const stripped = stripNumericPrefix(rawName);
    if (!stripped) continue;

    if (depth === 1 && isCategoryGroup(stripped)) {
      scanScardua(fullPath, line, company, sourceRoot, depth + 1, products, seenKeys);
      continue;
    }

    if (depth >= 2) {
      // Sub-pastas de produto (Fotos, Videos, Depoimentos)
      if (/^(fotos?|v[íi]deos?|videos?|imagens?|depoimentos?)$/iu.test(rawName)) continue;
      if (/^0?[0-9][.-]\s*(fotos?|v[íi]deos?|depoimentos?)/iu.test(rawName)) continue;

      const detectedLine = detectLineFromPath(fullPath, line);
      const key = normalizeKey(stripped) + '::' + normalizeKey(company);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const classification = classifyProduct(stripped, company, fullPath);
      products.push({
        name: stripped,
        line: detectedLine,
        category: classification.category,
        brand: classification.brand,
        companyId: null,
        companyName: classification.companyName,
        status: 'Ativo',
        sourceRoot,
        sourcePath: fullPath,
      });
    } else {
      scanScardua(fullPath, line, company, sourceRoot, depth + 1, products, seenKeys);
    }
  }
}

// ============================================================
// LEITURA RECURSIVA — modo FLAT (produtos direto na raiz)
// ============================================================
function scanFlat(folderPath, line, company, sourceRoot, products, seenKeys) {
  if (isBlockedPath(folderPath)) return;

  let entries;
  try { entries = fs.readdirSync(folderPath, { withFileTypes: true }); }
  catch (err) { console.warn(`  ⚠️  Não foi possível ler: ${folderPath}\n     ${err.message}`); return; }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const rawName  = entry.name;
    const fullPath = path.join(folderPath, rawName);

    if (isBlockedPath(fullPath)) continue;
    if (isGenericFolder(rawName)) continue;

    const stripped = stripNumericPrefix(rawName);
    if (!stripped) continue;

    const key = normalizeKey(stripped) + '::' + normalizeKey(company);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const classification = classifyProduct(stripped, company, fullPath);
    products.push({
      name: stripped,
      line,
      category: classification.category,
      brand: classification.brand,
      companyId: null,
      companyName: classification.companyName,
      status: 'Ativo',
      sourceRoot,
      sourcePath: fullPath,
    });
  }
}

// ============================================================
// LEITURA RECURSIVA — modo PORTO (sublinhas são linhas reais)
// Estrutura:
//   Raiz
//     01 - Linha Náutica    ← linha detectada pelo nome do grupo
//         01 - Produto X    ← produto
//     02 - Linha Amarela    ← linha detectada pelo nome
//         01 - Produto Y    ← produto
//     04 - Lojas            ← BLOQUEADO
// ============================================================
function scanPorto(folderPath, company, sourceRoot, products, seenKeys) {
  if (isBlockedPath(folderPath)) return;

  let topEntries;
  try { topEntries = fs.readdirSync(folderPath, { withFileTypes: true }); }
  catch (err) { console.warn(`  ⚠️  Não foi possível ler: ${folderPath}\n     ${err.message}`); return; }

  for (const topEntry of topEntries) {
    if (!topEntry.isDirectory()) continue;
    const topRaw  = topEntry.name;
    const topPath = path.join(folderPath, topRaw);

    // Bloquear Lojas e pastas genéricas no primeiro nível
    if (isBlockedPath(topPath)) { console.log(`  🚫 Ignorando (bloqueado): ${topRaw}`); continue; }
    if (isGenericFolder(topRaw)) continue;

    const topStripped = stripNumericPrefix(topRaw);
    // Detectar a linha pelo nome do grupo
    const groupLine = detectLineFromPath(topRaw + ' ' + topPath, null);

    // Dentro do grupo, cada subpasta é um produto
    let subEntries;
    try { subEntries = fs.readdirSync(topPath, { withFileTypes: true }); }
    catch (err) { continue; }

    for (const sub of subEntries) {
      if (!sub.isDirectory()) continue;
      const subRaw  = sub.name;
      const subPath = path.join(topPath, subRaw);

      if (isBlockedPath(subPath)) continue;
      if (isGenericFolder(subRaw)) continue;

      const stripped = stripNumericPrefix(subRaw);
      if (!stripped) continue;

      // Ignorar sub-pastas de produto (Fotos/Videos/Depoimentos)
      if (/^(fotos?|v[íi]deos?|videos?|imagens?|depoimentos?)$/iu.test(subRaw)) continue;
      if (/^0?[0-9][.-]\s*(fotos?|v[íi]deos?|depoimentos?)/iu.test(subRaw)) continue;

      const key = normalizeKey(stripped) + '::' + normalizeKey(company);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const classification = classifyProduct(stripped, company, subPath);
      products.push({
        name: stripped,
        line: groupLine,
        category: classification.category,
        brand: classification.brand,
        companyId: null,
        companyName: classification.companyName,
        status: 'Ativo',
        sourceRoot,
        sourcePath: subPath,
      });
    }
  }
}

// ============================================================
// MAIN
// ============================================================
function main() {
  console.log('\n🚀 Importação de produtos das pastas do Drive\n');

  const allProducts = [];
  const seenKeys    = new Set();
  const summary     = [];

  for (const root of ROOTS) {
    const { folderPath, line, company, sourceRoot, mode } = root;

    console.log(`📂 ${sourceRoot}:\n   ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
      console.warn(`   ❌ Pasta não encontrada: ${sourceRoot}\n`);
      summary.push({ sourceRoot, count: 0, found: false });
      continue;
    }

    const before = allProducts.length;

    if (mode === 'scardua') {
      scanScardua(folderPath, line, company, sourceRoot, 1, allProducts, seenKeys);
    } else if (mode === 'flat') {
      scanFlat(folderPath, line, company, sourceRoot, allProducts, seenKeys);
    } else if (mode === 'porto') {
      scanPorto(folderPath, company, sourceRoot, allProducts, seenKeys);
    }

    const count = allProducts.length - before;
    console.log(`   ✅ ${count} produto(s) encontrado(s)\n`);
    summary.push({ sourceRoot, count, found: true });
  }

  if (allProducts.length === 0) {
    console.error('❌ Nenhum produto encontrado. Verifique os caminhos e a estrutura de pastas.');
    process.exit(1);
  }

  // Ordenar por empresa → linha → nome
  allProducts.sort((a, b) => {
    const coCompare = a.companyName.localeCompare(b.companyName);
    if (coCompare !== 0) return coCompare;
    const lineCompare = (a.line || '').localeCompare(b.line || '');
    if (lineCompare !== 0) return lineCompare;
    return a.name.localeCompare(b.name);
  });

  // Salvar em public/importedProducts.json
  const outputDir  = path.join(__dirname, '..', 'public');
  const outputPath = path.join(outputDir, 'importedProducts.json');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf-8');

  // Relatório final
  console.log(`📄 Arquivo gerado: ${outputPath}`);
  console.log(`\n✅ Total de produtos mapeados: ${allProducts.length}`);
  console.log('\n─── Resumo por fonte ─────────────────────');
  for (const s of summary) {
    const status = s.found ? `${s.count} produto(s)` : '❌ pasta não encontrada';
    console.log(`  · ${s.sourceRoot}: ${status}`);
  }
  console.log('──────────────────────────────────────────\n');

  // Preview
  allProducts.forEach((p, i) => {
    const badge = p.companyName === 'PORTO LIVRE' ? '🔵' : '🟢';
    console.log(`  ${badge} ${String(i + 1).padStart(3, '0')}. [${p.line}] ${p.name}  (${p.category} | ${p.brand} | ${p.companyName})`);
  });
  console.log('\n');
}

main();
