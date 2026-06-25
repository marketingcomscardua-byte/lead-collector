function normalizeText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export const PRODUCT_CATEGORIES = [
  "Trator",
  "Microtrator",
  "Transportador Agrícola",
  "Escavadeira",
  "Mini Escavadeira",
  "Pá Carregadeira",
  "Empilhadeira",
  "Transpaleteira",
  "Peças",
  "Serviço",
  "Outros",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export function classifyProduct(
  rawName: string,
  sourceCompany?: string,
  sourcePath?: string
) {
  const name = String(rawName || "").trim();
  const pathStr = String(sourcePath || "");
  const companyStr = String(sourceCompany || "");
  
  const normalized = normalizeText(`${name} ${pathStr} ${companyStr}`);
  const normalizedName = normalizeText(name);

  // 1. Determine Brand & Company
  let brand = "Outras";
  let companyName = "Sem Empresa";

  // Check Lovol
  if (normalized.includes("lovol") || /^fr/i.test(name) || /^fl/i.test(name)) {
    brand = "Lovol";
    companyName = "PORTO LIVRE";
  }
  // Check Sunward
  else if (normalized.includes("sunward") || /^sw[a-z0-9-]*/i.test(name)) {
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
    companyName = sourceCompany || "Comercial Scardua";
  } else if (normalized.includes("yto")) {
    brand = "YTO";
    companyName = sourceCompany || "PORTO LIVRE";
  } else if (normalized.includes("barbieri")) {
    brand = "Barbieri";
    companyName = sourceCompany || "Comercial Scardua";
  } else if (normalized.includes("mercury")) {
    brand = "Mercury";
    companyName = sourceCompany || "PORTO LIVRE";
  } else if (normalized.includes("fibrafort")) {
    brand = "Fibrafort";
    companyName = sourceCompany || "PORTO LIVRE";
  } else if (normalized.includes("ventura")) {
    brand = "Ventura";
    companyName = sourceCompany || "PORTO LIVRE";
  } else if (normalized.includes("comercial scardua")) {
    brand = "Comercial Scardua";
    companyName = "Comercial Scardua";
  } else if (normalized.includes("porto livre")) {
    brand = "Porto Livre";
    companyName = "PORTO LIVRE";
  } else {
    // Fallback companyName based on path
    const pathNorm = normalizeText(pathStr);
    const companyNorm = normalizeText(companyStr);

    if (pathNorm.includes("comercial scardua") || companyNorm.includes("comercial scardua")) {
      companyName = "Comercial Scardua";
    } else if (pathNorm.includes("porto livre") || companyNorm.includes("porto livre")) {
      companyName = "PORTO LIVRE";
    } else if (sourceCompany) {
      companyName = sourceCompany;
    }
  }

  // 2. Determine Category (Strict list)
  let category: ProductCategory = "Outros";

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
  else if (/^fr/i.test(name)) {
    category = "Escavadeira";
  } else if (/^fl/i.test(name)) {
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
