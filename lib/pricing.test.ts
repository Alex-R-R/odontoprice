import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePrice, calculateQuoteTotals, DEFAULT_SETTINGS, normalizeMaterial, normalizeQuote, normalizeSettings, type Material, type Procedure, type PricingSettings, type QuoteItem } from './pricing.ts';

const materials: Material[] = [
  normalizeMaterial({ id: 'resina', name: 'Resina', category: 'Restauração', unit: 'unidade', unitCost: 18.5, updatedAt: '2026-08-28T10:00:00.000Z' }),
  normalizeMaterial({ id: 'anest', name: 'Anestésico', category: 'Anestésico', packageQuantity: 10, consumptionUnit: 'unidade', purchaseUnit: 'caixa', packagePrice: 32, updatedAt: '2026-08-25T10:00:00.000Z' }),
  normalizeMaterial({ id: 'luva', name: 'Luva', category: 'Descartável', unit: 'par', unitCost: 0.85, updatedAt: '2026-08-21T10:00:00.000Z' }),
];
const procedure: Procedure = { id: 'restauracao', name: 'Restauração', category: 'Clínica geral', durationMinutes: 75, otherVariableCost: 4, materials: [{ materialId: 'resina', quantity: 1 }, { materialId: 'anest', quantity: 1 }, { materialId: 'luva', quantity: 1 }] };
const settings = normalizeSettings({ monthlyFixedCosts: 12000, monthlyClinicalHours: DEFAULT_SETTINGS.monthlyClinicalHours, taxRate: DEFAULT_SETTINGS.taxRate, paymentFeeRate: DEFAULT_SETTINGS.paymentFeeRate, defaultMargin: DEFAULT_SETTINGS.defaultMargin });

test('calcula custo base pela embalagem e migra registro legado', () => {
  assert.equal(materials[1].baseUnitCost, 3.2);
  assert.equal(materials[0].packageQuantity, 1);
  assert.equal(materials[0].packagePrice, 18.5);
});
test('calcula custo real somando materiais, variáveis e rateio fixo', () => {
  const result = calculatePrice(procedure, settings, materials);
  assert.ok(Math.abs(result.variableCost - 26.55) < 0.001);
  assert.ok(Math.abs(result.fixedAllocation - 125) < 0.001);
  assert.ok(Math.abs(result.realCost - 151.55) < 0.001);
});
test('calcula preço mínimo protegendo impostos e taxas', () => {
  const result = calculatePrice(procedure, settings, materials);
  assert.ok(Math.abs(result.minimumPrice - (151.55 / 0.92)) < 0.001);
  assert.ok(result.minimumPrice > result.realCost);
});
test('aplica margem, desconto e preserva custo real', () => {
  const standard = calculatePrice(procedure, settings, materials);
  const premium = calculatePrice(procedure, settings, materials, 0, 50);
  const discounted = calculatePrice(procedure, settings, materials, 15);
  assert.ok(Math.abs(standard.recommendedPrice - standard.minimumPrice * 1.3) < 0.001);
  assert.ok(premium.recommendedPrice > standard.recommendedPrice);
  assert.equal(discounted.realCost, standard.realCost);
  assert.ok(discounted.profit < standard.profit);
});
test('custos fixos detalhados têm precedência sobre o campo legado', () => {
  const changed: PricingSettings = normalizeSettings({ ...settings, monthlyFixedCosts: 24000, fixedCosts: [{ id: 'rent', name: 'Aluguel', category: 'Estrutura', monthlyValue: 24000, active: true }] });
  assert.equal(changed.monthlyFixedCosts, 24000);
  assert.equal(calculatePrice(procedure, changed, materials).fixedAllocation, 250);
});
test('aceita procedimento sem materiais e quantidade fracionada', () => {
  const noMaterial = { ...procedure, materials: [], otherVariableCost: 10 };
  assert.equal(calculatePrice(noMaterial, settings, materials).variableCost, 10);
  const fractional = { ...procedure, materials: [{ materialId: 'resina', quantity: 0.5 }] };
  assert.ok(calculatePrice(fractional, settings, materials).variableCost < 20);
});
test('calcula desconto percentual e preserva custo, impostos e lucro', () => {
  const items: QuoteItem[] = [{ id: 'item', procedureId: 'restauracao', procedureName: 'Restauração', quantity: 2, unitPrice: 500, unitCost: 150, durationMinutes: 60 }];
  const result = calculateQuoteTotals(items, 10, 'percentual', 6, 2);
  assert.equal(result.subtotal, 1000);
  assert.equal(result.discountAmount, 100);
  assert.equal(result.total, 900);
  assert.equal(result.costTotal, 300);
  assert.equal(result.taxesAndFees, 72);
  assert.equal(result.profit, 528);
  assert.equal(result.validDiscount, true);
});
test('calcula desconto fixo e bloqueia desconto acima do subtotal', () => {
  const items: QuoteItem[] = [{ id: 'item', procedureId: 'clareamento', procedureName: 'Clareamento', quantity: 1, unitPrice: 750, unitCost: 200, durationMinutes: 45 }];
  const fixed = calculateQuoteTotals(items, 100, 'fixed', 0, 0);
  const invalid = calculateQuoteTotals(items, 800, 'fixed', 0, 0);
  assert.equal(fixed.discountAmount, 100);
  assert.equal(fixed.total, 650);
  assert.equal(invalid.total, 0);
  assert.equal(invalid.validDiscount, false);
});
test('normaliza orçamento legado sem substituir preço salvo', () => {
  const quote = normalizeQuote({ id: 'legacy', clientName: 'Paciente', items: [{ id: 'item', procedureId: 'p', procedureName: 'Serviço', quantity: 1, unitPrice: 400 }], discount: 5, total: 380, createdAt: '2026-08-01T10:00:00.000Z' }, 6, 2, 30);
  assert.equal(quote.total, 380);
  assert.equal(quote.discountMode, 'percentual');
  assert.equal(quote.items[0].unitPrice, 400);
});

