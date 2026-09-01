import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePrice, DEFAULT_SETTINGS, normalizeMaterial, normalizeSettings, type Material, type Procedure, type PricingSettings } from './pricing.ts';

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

