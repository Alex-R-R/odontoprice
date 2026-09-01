export type ProcedureMaterial = { materialId: string; quantity: number };
export type Material = { id: string; name: string; unit: string; unitCost: number; updatedAt: string };
export type Procedure = { id: string; name: string; category: string; durationMinutes: number; otherVariableCost: number; materials: ProcedureMaterial[] };
export type PricingSettings = { monthlyFixedCosts: number; monthlyClinicalHours: number; taxRate: number; paymentFeeRate: number; defaultMargin: number };
export type HistoryEntry = { id: string; action: string; detail: string; createdAt: string };
export type Calculation = { variableCost: number; fixedAllocation: number; realCost: number; minimumPrice: number; recommendedPrice: number; discountedPrice: number; taxesAndFees: number; profit: number; profitMargin: number; margin: number; taxRate: number; feeRate: number };

export const DEFAULT_SETTINGS: PricingSettings = { monthlyFixedCosts: 12000, monthlyClinicalHours: 120, taxRate: 6, paymentFeeRate: 2, defaultMargin: 30 };
export const DEFAULT_MATERIALS: Material[] = [
  { id: 'mat-resina', name: 'Resina composta A1', unit: 'unidade', unitCost: 18.5, updatedAt: '2026-08-28T10:00:00.000Z' },
  { id: 'mat-anest', name: 'Anestésico local', unit: 'unidade', unitCost: 3.2, updatedAt: '2026-08-25T10:00:00.000Z' },
  { id: 'mat-luva', name: 'Luva de procedimento', unit: 'par', unitCost: 0.85, updatedAt: '2026-08-21T10:00:00.000Z' },
  { id: 'mat-alginato', name: 'Alginato para moldagem', unit: 'kit', unitCost: 12.9, updatedAt: '2026-08-19T10:00:00.000Z' },
  { id: 'mat-implante', name: 'Implante osseointegrável', unit: 'unidade', unitCost: 680, updatedAt: '2026-08-15T10:00:00.000Z' },
  { id: 'mat-gel', name: 'Gel clareador 22%', unit: 'kit', unitCost: 95, updatedAt: '2026-08-11T10:00:00.000Z' },
];
export const DEFAULT_PROCEDURES: Procedure[] = [
  { id: 'proc-avaliacao', name: 'Avaliação clínica', category: 'Prevenção', durationMinutes: 45, otherVariableCost: 0, materials: [{ materialId: 'mat-luva', quantity: 1 }] },
  { id: 'proc-restauracao', name: 'Restauração em resina', category: 'Clínica geral', durationMinutes: 75, otherVariableCost: 4, materials: [{ materialId: 'mat-resina', quantity: 1 }, { materialId: 'mat-anest', quantity: 1 }, { materialId: 'mat-luva', quantity: 1 }] },
  { id: 'proc-clareamento', name: 'Clareamento de consultório', category: 'Estética', durationMinutes: 90, otherVariableCost: 8, materials: [{ materialId: 'mat-gel', quantity: 1 }, { materialId: 'mat-luva', quantity: 1 }] },
  { id: 'proc-implante', name: 'Implante unitário', category: 'Implantodontia', durationMinutes: 150, otherVariableCost: 35, materials: [{ materialId: 'mat-implante', quantity: 1 }, { materialId: 'mat-anest', quantity: 2 }, { materialId: 'mat-luva', quantity: 2 }] },
];

export function calculatePrice(procedure: Procedure, settings: PricingSettings, materials: Material[], discount = 0, margin = settings.defaultMargin): Calculation {
  const materialCost = procedure.materials.reduce((sum, item) => sum + (materials.find((material) => material.id === item.materialId)?.unitCost ?? 0) * item.quantity, 0);
  const variableCost = materialCost + Math.max(0, procedure.otherVariableCost || 0);
  const fixedAllocation = (settings.monthlyFixedCosts / Math.max(settings.monthlyClinicalHours, 1)) * (procedure.durationMinutes / 60);
  const realCost = variableCost + fixedAllocation;
  const taxRate = Math.max(0, settings.taxRate || 0) / 100;
  const feeRate = Math.max(0, settings.paymentFeeRate || 0) / 100;
  const netRate = Math.max(0.01, 1 - taxRate - feeRate);
  const minimumPrice = realCost / netRate;
  const recommendedPrice = minimumPrice * (1 + Math.max(0, margin) / 100);
  const discountedPrice = recommendedPrice * (1 - Math.min(100, Math.max(0, discount)) / 100);
  const taxesAndFees = discountedPrice * (taxRate + feeRate);
  const profit = discountedPrice - taxesAndFees - realCost;
  return { variableCost, fixedAllocation, realCost, minimumPrice, recommendedPrice, discountedPrice, taxesAndFees, profit, profitMargin: discountedPrice ? (profit / discountedPrice) * 100 : 0, margin: Math.max(0, margin), taxRate: taxRate * 100, feeRate: feeRate * 100 };
}
