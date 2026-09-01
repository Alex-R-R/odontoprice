import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePrice, DEFAULT_MATERIALS, DEFAULT_PROCEDURES, DEFAULT_SETTINGS, type Procedure, type PricingSettings } from './pricing.ts';

const procedure = DEFAULT_PROCEDURES.find((item) => item.id === 'proc-restauracao') as Procedure;

test('calcula custo real somando materiais, variáveis e rateio fixo', () => {
  const result = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS);
  assert.ok(Math.abs(result.variableCost - 26.55) < 0.001);
  assert.ok(Math.abs(result.fixedAllocation - 125) < 0.001);
  assert.ok(Math.abs(result.realCost - 151.55) < 0.001);
});

test('calcula preço mínimo protegendo impostos e taxas', () => {
  const result = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS);
  assert.ok(Math.abs(result.minimumPrice - (151.55 / 0.92)) < 0.001);
  assert.ok(result.minimumPrice > result.realCost);
});

test('aplica margem padrão e margem personalizada', () => {
  const standard = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS);
  const premium = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS, 0, 50);
  assert.ok(Math.abs(standard.recommendedPrice - standard.minimumPrice * 1.3) < 0.001);
  assert.ok(premium.recommendedPrice > standard.recommendedPrice);
});

test('desconto reduz preço e lucro sem alterar custo real', () => {
  const full = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS);
  const discounted = calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS, 15);
  assert.equal(discounted.realCost, full.realCost);
  assert.ok(Math.abs(discounted.discountedPrice - full.recommendedPrice * 0.85) < 0.001);
  assert.ok(discounted.profit < full.profit);
});

test('altera resultado quando parâmetros financeiros mudam', () => {
  const changed: PricingSettings = { ...DEFAULT_SETTINGS, monthlyFixedCosts: 24000, taxRate: 10, paymentFeeRate: 5 };
  const result = calculatePrice(procedure, changed, DEFAULT_MATERIALS);
  assert.equal(result.fixedAllocation, 250);
  assert.ok(result.minimumPrice > calculatePrice(procedure, DEFAULT_SETTINGS, DEFAULT_MATERIALS).minimumPrice);
});

test('aceita procedimento sem materiais e quantidade fracionada', () => {
  const noMaterial: Procedure = { ...procedure, materials: [], otherVariableCost: 10 };
  const result = calculatePrice(noMaterial, DEFAULT_SETTINGS, DEFAULT_MATERIALS);
  assert.equal(result.variableCost, 10);
  const fractional = { ...procedure, materials: [{ materialId: 'mat-resina', quantity: 0.5 }] };
  assert.ok(calculatePrice(fractional, DEFAULT_SETTINGS, DEFAULT_MATERIALS).variableCost < result.variableCost + 20);
});
