export type ProcedureMaterial = { materialId: string; quantity: number };
export type MaterialPriceHistory = { id: string; materialId: string; previousPackagePrice: number; newPackagePrice: number; updatedAt: string; supplier?: string };
export type Material = { id: string; name: string; category: string; purchaseUnit: string; packageQuantity: number; consumptionUnit: string; packagePrice: number; baseUnitCost: number; supplier: string; updatedAt: string; active: boolean; priceHistory: MaterialPriceHistory[] };
export type Procedure = { id: string; name: string; category: string; durationMinutes: number; otherVariableCost: number; materials: ProcedureMaterial[] };
export type FixedCost = { id: string; name: string; category: string; monthlyValue: number; active: boolean };
export type BrandingSettings = { appName: string; clinicName: string; dentistName: string; logoText: string; logoSymbol: string; logoDataUrl?: string; primaryColor: string; accentColor: string };
export type PricingSettings = { monthlyFixedCosts: number; monthlyClinicalHours: number; taxRate: number; paymentFeeRate: number; defaultMargin: number; fixedCosts: FixedCost[]; branding: BrandingSettings; theme: 'light' | 'dark' };
export type HistoryEntry = { id: string; action: string; detail: string; createdAt: string };
export type QuoteItem = { id: string; procedureId: string; procedureName: string; quantity: number; unitPrice: number };
export type Quote = { id: string; clientName: string; items: QuoteItem[]; discount: number; total: number; createdAt: string };
export type Calculation = { variableCost: number; fixedAllocation: number; realCost: number; minimumPrice: number; recommendedPrice: number; discountedPrice: number; taxesAndFees: number; profit: number; profitMargin: number; margin: number; taxRate: number; feeRate: number };

export const MATERIAL_CATEGORIES = ['Anestésico', 'Descartável', 'Implantodontia', 'Moldagem', 'Ortodontia', 'Restauração', 'Clareamento', 'Outro'];
export const MATERIAL_UNITS = ['unidade', 'par', 'kit', 'caixa', 'ml', 'g', 'm', 'pote'];
export const FIXED_COST_CATEGORIES = ['Estrutura', 'Pessoal', 'Tecnologia', 'Administrativo', 'Marketing', 'Outros'];
export const DEFAULT_BRANDING: BrandingSettings = { appName: 'OdontoPrice', clinicName: 'Minha clínica odontológica', dentistName: 'Dra. Fernanda T. Gonçalves', logoText: 'OP', logoSymbol: '✦', primaryColor: '#bd587f', accentColor: '#edabc0' };
export const DEFAULT_SETTINGS: PricingSettings = { monthlyFixedCosts: 0, monthlyClinicalHours: 120, taxRate: 6, paymentFeeRate: 2, defaultMargin: 30, fixedCosts: [], branding: DEFAULT_BRANDING, theme: 'light' };
export const DEFAULT_MATERIALS: Material[] = [];
export const DEFAULT_PROCEDURES: Procedure[] = [];

export const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);
export const formatDate = (value: string) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', ''); };
export const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const safeNumber = (value: unknown, fallback = 0) => { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : fallback; };
const safePositive = (value: unknown, fallback = 1) => Math.max(0.000001, safeNumber(value, fallback));

export function normalizeMaterial(raw: Partial<Material> & { unit?: string; unitCost?: number }): Material {
  const legacyUnit = raw.purchaseUnit || raw.consumptionUnit || raw.unit || 'unidade';
  const packageQuantity = safePositive(raw.packageQuantity, 1);
  const packagePrice = Math.max(0, safeNumber(raw.packagePrice, safeNumber(raw.unitCost, 0)));
  return { id: raw.id || `material-${Date.now()}`, name: String(raw.name || '').trim(), category: raw.category || 'Outro', purchaseUnit: legacyUnit, packageQuantity, consumptionUnit: raw.consumptionUnit || legacyUnit, packagePrice, baseUnitCost: packagePrice / packageQuantity, supplier: raw.supplier || '', updatedAt: raw.updatedAt || new Date().toISOString(), active: raw.active !== false, priceHistory: Array.isArray(raw.priceHistory) ? raw.priceHistory : [] };
}

export function normalizeProcedure(raw: Partial<Procedure>): Procedure {
  return { id: raw.id || `procedure-${Date.now()}`, name: String(raw.name || '').trim(), category: raw.category || 'Outro', durationMinutes: Math.max(1, safeNumber(raw.durationMinutes, 1)), otherVariableCost: Math.max(0, safeNumber(raw.otherVariableCost, 0)), materials: Array.isArray(raw.materials) ? raw.materials.map((item) => ({ materialId: item.materialId, quantity: Math.max(0, safeNumber(item.quantity, 0)) })).filter((item) => item.materialId) : [] };
}

export function normalizeSettings(raw: Partial<PricingSettings> = {}): PricingSettings {
  const legacyFixed = Math.max(0, safeNumber(raw.monthlyFixedCosts, 0));
  const fixedCosts = Array.isArray(raw.fixedCosts) ? raw.fixedCosts.map((item) => ({ id: item.id || `fixed-${Date.now()}`, name: String(item.name || 'Custo fixo').trim(), category: item.category || 'Outros', monthlyValue: Math.max(0, safeNumber(item.monthlyValue, 0)), active: item.active !== false })) : (legacyFixed > 0 ? [{ id: 'legacy-fixed-cost', name: 'Custos fixos gerais', category: 'Estrutura', monthlyValue: legacyFixed, active: true }] : []);
  const branding = { ...DEFAULT_BRANDING, ...raw.branding };
  return { monthlyFixedCosts: fixedCosts.reduce((sum, item) => sum + (item.active ? item.monthlyValue : 0), 0), monthlyClinicalHours: Math.max(1, safeNumber(raw.monthlyClinicalHours, DEFAULT_SETTINGS.monthlyClinicalHours)), taxRate: Math.max(0, safeNumber(raw.taxRate, DEFAULT_SETTINGS.taxRate)), paymentFeeRate: Math.max(0, safeNumber(raw.paymentFeeRate, DEFAULT_SETTINGS.paymentFeeRate)), defaultMargin: Math.max(0, safeNumber(raw.defaultMargin, DEFAULT_SETTINGS.defaultMargin)), fixedCosts, branding, theme: raw.theme === 'dark' ? 'dark' : 'light' };
}

export function getMonthlyFixedCosts(settings: PricingSettings) { return settings.fixedCosts?.length ? settings.fixedCosts.reduce((sum, item) => sum + (item.active ? Math.max(0, item.monthlyValue) : 0), 0) : Math.max(0, safeNumber(settings.monthlyFixedCosts, 0)); }

export function calculatePrice(procedure: Procedure, settings: PricingSettings, materials: Material[], discount = 0, margin = settings.defaultMargin): Calculation {
  const materialCost = procedure.materials.reduce((sum, item) => sum + (materials.find((material) => material.id === item.materialId)?.baseUnitCost ?? 0) * Math.max(0, safeNumber(item.quantity)), 0);
  const variableCost = materialCost + Math.max(0, safeNumber(procedure.otherVariableCost));
  const fixedAllocation = (getMonthlyFixedCosts(settings) / Math.max(settings.monthlyClinicalHours, 1)) * (Math.max(1, procedure.durationMinutes) / 60);
  const realCost = variableCost + fixedAllocation;
  const taxRate = Math.max(0, safeNumber(settings.taxRate)) / 100;
  const feeRate = Math.max(0, safeNumber(settings.paymentFeeRate)) / 100;
  const netRate = Math.max(0.01, 1 - taxRate - feeRate);
  const minimumPrice = realCost / netRate;
  const recommendedPrice = minimumPrice * (1 + Math.max(0, safeNumber(margin)) / 100);
  const discountedPrice = recommendedPrice * (1 - Math.min(100, Math.max(0, safeNumber(discount))) / 100);
  const taxesAndFees = discountedPrice * (taxRate + feeRate);
  const profit = discountedPrice - taxesAndFees - realCost;
  return { variableCost, fixedAllocation, realCost, minimumPrice, recommendedPrice, discountedPrice, taxesAndFees, profit, profitMargin: discountedPrice ? (profit / discountedPrice) * 100 : 0, margin: Math.max(0, safeNumber(margin)), taxRate: taxRate * 100, feeRate: feeRate * 100 };
}

