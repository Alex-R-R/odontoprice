export type ProcedureMaterial = { materialId: string; quantity: number };
export type MaterialPriceHistory = { id: string; materialId: string; previousPackagePrice: number; newPackagePrice: number; updatedAt: string; supplier?: string };
export type Material = { id: string; name: string; category: string; purchaseUnit: string; packageQuantity: number; consumptionUnit: string; packagePrice: number; baseUnitCost: number; supplier: string; updatedAt: string; active: boolean; priceHistory: MaterialPriceHistory[] };
export type Procedure = { id: string; name: string; category: string; durationMinutes: number; otherVariableCost: number; materials: ProcedureMaterial[]; active?: boolean };
export type FixedCost = { id: string; name: string; category: string; monthlyValue: number; active: boolean };
export type BrandingSettings = { appName: string; subtitle: string; clinicName: string; dentistName: string; logoText: string; logoSymbol: string; logoDataUrl?: string; primaryColor: string; accentColor: string };
export type PricingSettings = { monthlyFixedCosts: number; monthlyClinicalHours: number; taxRate: number; paymentFeeRate: number; defaultMargin: number; fixedCosts: FixedCost[]; branding: BrandingSettings; theme: 'light' | 'dark' };
export type HistoryEntry = { id: string; action: string; detail: string; createdAt: string };
export type QuoteDiscountMode = 'percentual' | 'percent' | 'fixed';
export type QuoteItem = { id: string; procedureId: string; procedureName: string; quantity: number; unitPrice: number; unitCost?: number; durationMinutes?: number };
export type OtherProfessional = { id: string; name: string; area: string; active: boolean; updatedAt: string };
export type QuoteProfessionalItem = { id: string; professionalId: string; professionalName: string; area: string; service: string; amount: number };
export type QuoteInformation = { clinicName: string; dentistName: string; cro: string; phone: string; email: string; address: string; city: string; validityDays: number; paymentTerms: string; notes: string };
export type Quote = { id: string; clientName: string; items: QuoteItem[]; professionalItems: QuoteProfessionalItem[]; documentInfo: QuoteInformation; discount: number; discountMode: QuoteDiscountMode; discountAmount: number; subtotal: number; total: number; costTotal: number; taxesAndFees: number; profit: number; profitMargin: number; taxRate: number; paymentFeeRate: number; defaultMargin: number; createdAt: string; updatedAt: string };
export type QuoteTotals = { subtotal: number; professionalTotal: number; discountAmount: number; total: number; costTotal: number; taxesAndFees: number; profit: number; profitMargin: number; validDiscount: boolean };
export type Calculation = { variableCost: number; fixedAllocation: number; realCost: number; minimumPrice: number; recommendedPrice: number; discountedPrice: number; taxesAndFees: number; profit: number; profitMargin: number; margin: number; taxRate: number; feeRate: number };
export type FinancialEntry = { id: string; clientName: string; procedureName: string; date: string; amount: number; cost: number; notes: string };

export const MATERIAL_CATEGORIES = ['Anestésico', 'Descartável', 'Implantodontia', 'Moldagem', 'Ortodontia', 'Restauração', 'Clareamento', 'Outro'];
export const MATERIAL_UNITS = ['unidade', 'par', 'kit', 'caixa', 'ml', 'g', 'm', 'pote'];
export const FIXED_COST_CATEGORIES = ['Estrutura', 'Pessoal', 'Tecnologia', 'Administrativo', 'Marketing', 'Outros'];
export const DEFAULT_BRANDING: BrandingSettings = { appName: 'FTG Odontologia', subtitle: 'Gestão & Precificação Odontológica', clinicName: 'FTG Odontologia', dentistName: 'Dra. Fernanda T. Gonçalves', logoText: 'FTG', logoSymbol: '✦', primaryColor: '#bd587f', accentColor: '#edabc0' };
export const DEFAULT_QUOTE_INFORMATION: QuoteInformation = { clinicName: 'FTG Odontologia', dentistName: 'Dra. Fernanda T. Gonçalves', cro: '', phone: '', email: '', address: '', city: '', validityDays: 15, paymentTerms: 'A combinar', notes: '' };
export const DEFAULT_SETTINGS: PricingSettings = { monthlyFixedCosts: 0, monthlyClinicalHours: 120, taxRate: 6, paymentFeeRate: 2, defaultMargin: 30, fixedCosts: [], branding: DEFAULT_BRANDING, theme: 'light' };
export const DEFAULT_MATERIALS: Material[] = [];
export const DEFAULT_PROCEDURES: Procedure[] = [];

export const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);
export const formatPercent = (value: number) => `${(Number.isFinite(value) ? value : 0).toFixed(2).replace('.', ',')}%`;
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
  return { id: raw.id || `procedure-${Date.now()}`, name: String(raw.name || '').trim(), category: raw.category || 'Outro', durationMinutes: Math.max(1, safeNumber(raw.durationMinutes, 1)), otherVariableCost: Math.max(0, safeNumber(raw.otherVariableCost, 0)), materials: Array.isArray(raw.materials) ? raw.materials.map((item) => ({ materialId: item.materialId, quantity: Math.max(0, safeNumber(item.quantity, 0)) })).filter((item) => item.materialId) : [], active: raw.active !== false };
}

export function normalizeOtherProfessional(raw: Partial<OtherProfessional> & { service?: unknown; amount?: unknown }): OtherProfessional {
  return { id: raw.id || `professional-${Date.now()}`, name: String(raw.name || '').trim(), area: String(raw.area || '').trim(), active: raw.active !== false, updatedAt: raw.updatedAt || new Date().toISOString() };
}

export function normalizeQuoteInformation(raw: Partial<QuoteInformation> = {}): QuoteInformation {
  return { clinicName: String(raw.clinicName || DEFAULT_QUOTE_INFORMATION.clinicName).trim(), dentistName: String(raw.dentistName || DEFAULT_QUOTE_INFORMATION.dentistName).trim(), cro: String(raw.cro || '').trim(), phone: String(raw.phone || '').trim(), email: String(raw.email || '').trim(), address: String(raw.address || '').trim(), city: String(raw.city || '').trim(), validityDays: Math.max(1, Math.round(safeNumber(raw.validityDays, DEFAULT_QUOTE_INFORMATION.validityDays))), paymentTerms: String(raw.paymentTerms || DEFAULT_QUOTE_INFORMATION.paymentTerms).trim(), notes: String(raw.notes || '').trim() };
}

export function normalizeSettings(raw: Partial<PricingSettings> = {}): PricingSettings {
  const legacyFixed = Math.max(0, safeNumber(raw.monthlyFixedCosts, 0));
  const fixedCosts = Array.isArray(raw.fixedCosts) ? raw.fixedCosts.map((item) => ({ id: item.id || `fixed-${Date.now()}`, name: String(item.name || 'Custo fixo').trim(), category: item.category || 'Outros', monthlyValue: Math.max(0, safeNumber(item.monthlyValue, 0)), active: item.active !== false })) : (legacyFixed > 0 ? [{ id: 'legacy-fixed-cost', name: 'Custos fixos gerais', category: 'Estrutura', monthlyValue: legacyFixed, active: true }] : []);
  const brandingSource: Partial<BrandingSettings> = raw.branding || {};
  const legacyBrandNames = ['OdontoPrice', 'Precificação', 'Precificação Odontológica'];
  const branding = { ...DEFAULT_BRANDING, ...brandingSource, appName: brandingSource.appName && !legacyBrandNames.includes(brandingSource.appName) ? brandingSource.appName : DEFAULT_BRANDING.appName, logoText: brandingSource.logoText === 'OP' ? DEFAULT_BRANDING.logoText : brandingSource.logoText || DEFAULT_BRANDING.logoText };
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

export function calculateQuoteTotals(items: QuoteItem[], discount = 0, discountMode: QuoteDiscountMode = 'percent', taxRate = 0, paymentFeeRate = 0, professionalItems: QuoteProfessionalItem[] = []): QuoteTotals {
  const professionalTotal = professionalItems.reduce((sum, item) => sum + Math.max(0, safeNumber(item.amount)), 0);
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, safeNumber(item.quantity)) * Math.max(0, safeNumber(item.unitPrice)), 0) + professionalTotal;
  const requestedDiscount = Math.max(0, safeNumber(discount));
  const discountAmount = discountMode === 'fixed' ? Math.min(subtotal, requestedDiscount) : subtotal * Math.min(100, requestedDiscount) / 100;
  const validDiscount = discountMode === 'fixed' ? requestedDiscount <= subtotal + 0.000001 : requestedDiscount <= 100;
  const total = Math.max(0, subtotal - discountAmount);
  const costTotal = items.reduce((sum, item) => sum + Math.max(0, safeNumber(item.quantity)) * Math.max(0, safeNumber(item.unitCost)), 0) + professionalTotal;
  const taxesAndFees = total * (Math.max(0, safeNumber(taxRate)) + Math.max(0, safeNumber(paymentFeeRate))) / 100;
  const profit = total - taxesAndFees - costTotal;
  return { subtotal, professionalTotal, discountAmount, total, costTotal, taxesAndFees, profit, profitMargin: total ? profit / total * 100 : 0, validDiscount };
}

export function normalizeFinancialEntry(raw: Partial<FinancialEntry>): FinancialEntry {
  const date = typeof raw.date === 'string' && !Number.isNaN(new Date(raw.date).getTime()) ? raw.date : new Date().toISOString().slice(0, 10);
  return { id: raw.id || `entry-${Date.now()}`, clientName: String(raw.clientName || '').trim(), procedureName: String(raw.procedureName || '').trim(), date: dateInputValue(date), amount: Math.max(0, safeNumber(raw.amount)), cost: Math.max(0, safeNumber(raw.cost)), notes: String(raw.notes || '').trim() };
}

const dateInputValue = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
};

export function calculateFinancialSummary(entries: FinancialEntry[], start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00`).getTime();
  const endTime = new Date(`${end}T23:59:59.999`).getTime();
  const filtered = entries.filter((entry) => {
    const time = new Date(`${entry.date}T12:00:00`).getTime();
    return Number.isFinite(time) && time >= startTime && time <= endTime;
  });
  const revenue = filtered.reduce((sum, entry) => sum + Math.max(0, safeNumber(entry.amount)), 0);
  const cost = filtered.reduce((sum, entry) => sum + Math.max(0, safeNumber(entry.cost)), 0);
  const profit = revenue - cost;
  return { entries: filtered, revenue, cost, profit, margin: revenue ? profit / revenue * 100 : 0 };
}

export function normalizeQuote(raw: Partial<Quote> & { discountMode?: QuoteDiscountMode }, fallbackTaxRate = 0, fallbackPaymentFeeRate = 0, fallbackMargin = 0): Quote {
  const items = Array.isArray(raw.items) ? raw.items.map((item) => ({ id: item.id || `quote-item-${Date.now()}`, procedureId: item.procedureId || '', procedureName: String(item.procedureName || 'Procedimento'), quantity: Math.max(0, safeNumber(item.quantity, 1)), unitPrice: Math.max(0, safeNumber(item.unitPrice)), unitCost: Math.max(0, safeNumber(item.unitCost)), durationMinutes: Math.max(0, safeNumber(item.durationMinutes, 0)) })) : [];
  const professionalItems = Array.isArray(raw.professionalItems) ? raw.professionalItems.map((item) => ({ id: item.id || `quote-professional-${Date.now()}`, professionalId: item.professionalId || '', professionalName: String(item.professionalName || 'Profissional parceiro'), area: String(item.area || '').trim(), service: String(item.service || '').trim(), amount: Math.max(0, safeNumber(item.amount)) })) : [];
  const documentInfo = normalizeQuoteInformation(raw.documentInfo);
  const discountMode = raw.discountMode === 'fixed' ? 'fixed' : 'percentual';
  const taxRate = Math.max(0, safeNumber(raw.taxRate, fallbackTaxRate));
  const paymentFeeRate = Math.max(0, safeNumber(raw.paymentFeeRate, fallbackPaymentFeeRate));
  const totals = calculateQuoteTotals(items, raw.discount, discountMode, taxRate, paymentFeeRate, professionalItems);
  const legacyTotal = safeNumber(raw.total, totals.total);
  return { id: raw.id || `quote-${Date.now()}`, clientName: String(raw.clientName || '').trim(), items, professionalItems, documentInfo, discount: Math.max(0, safeNumber(raw.discount)), discountMode, discountAmount: Number.isFinite(raw.discountAmount) ? Math.max(0, safeNumber(raw.discountAmount)) : totals.discountAmount, subtotal: Number.isFinite(raw.subtotal) ? Math.max(0, safeNumber(raw.subtotal)) : totals.subtotal, total: Number.isFinite(raw.total) ? Math.max(0, legacyTotal) : totals.total, costTotal: Number.isFinite(raw.costTotal) ? Math.max(0, safeNumber(raw.costTotal)) : totals.costTotal, taxesAndFees: Number.isFinite(raw.taxesAndFees) ? Math.max(0, safeNumber(raw.taxesAndFees)) : totals.taxesAndFees, profit: Number.isFinite(raw.profit) ? safeNumber(raw.profit) : totals.profit, profitMargin: Number.isFinite(raw.profitMargin) ? safeNumber(raw.profitMargin) : totals.profitMargin, taxRate, paymentFeeRate, defaultMargin: Math.max(0, safeNumber(raw.defaultMargin, fallbackMargin)), createdAt: raw.createdAt || new Date().toISOString(), updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString() };
}

