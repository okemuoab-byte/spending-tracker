import { describe, it, expect } from 'vitest';
import { fmt, fmtK, autocat, autocatInc } from './finance.js';

describe('fmt', () => {
  it('formats positive numbers with £ prefix and 2dp', () => {
    expect(fmt(1234.5)).toBe('£1234.50');
  });
  it('formats negative numbers as positive (Math.abs)', () => {
    expect(fmt(-386.94)).toBe('£386.94');
  });
  it('formats zero', () => {
    expect(fmt(0)).toBe('£0.00');
  });
});

describe('fmtK', () => {
  it('formats values under £1000 as rounded integer', () => {
    expect(fmtK(975)).toBe('£975');
  });
  it('formats values >= £1000 with k suffix to 1dp', () => {
    expect(fmtK(2200)).toBe('£2.2k');
    expect(fmtK(1000)).toBe('£1.0k');
  });
  it('rounds sub-1000 values', () => {
    expect(fmtK(99.7)).toBe('£100');
  });
});

describe('autocat', () => {
  it('classifies rent payments', () => {
    expect(autocat('THOMAS KNIGHT')).toBe('Rent');
  });
  it('classifies grocery shops', () => {
    expect(autocat('TESCO EXTRA')).toBe('Groceries');
    expect(autocat('SAINSBURY')).toBe('Groceries');
  });
  it('classifies TfL transport', () => {
    expect(autocat('TFL TRAVEL')).toBe('Transport');
  });
  it('classifies Uber trips as Transport', () => {
    expect(autocat('UBER TRIP')).toBe('Transport');
  });
  it('classifies Uber Eats as Eating Out', () => {
    expect(autocat('UBER EATS')).toBe('Eating Out & Cafes');
  });
  it('classifies Spotify as Subscriptions', () => {
    expect(autocat('SPOTIFY')).toBe('Subscriptions');
  });
  it('classifies Amazon Prime as Subscriptions, not Shopping', () => {
    expect(autocat('AMAZON PRIME')).toBe('Subscriptions');
  });
  it('classifies PureGym as Gym & Fitness', () => {
    expect(autocat('PUREGYM LONDON')).toBe('Gym & Fitness');
  });
  it('classifies O2 phone bill', () => {
    expect(autocat('O2 MOBILE')).toBe('Phone Bill');
  });
  it('classifies Royal Free as Healthcare', () => {
    expect(autocat('ROYAL FREE LONDON')).toBe('Healthcare');
  });
  it('classifies Amazon (non-Prime) as Shopping', () => {
    expect(autocat('AMAZON MARKETPLACE')).toBe('Shopping');
  });
  it('falls back to Other for unrecognised descriptions', () => {
    expect(autocat('SOME RANDOM MERCHANT XYZ')).toBe('Other');
  });
});

describe('autocatInc', () => {
  it('classifies NHS Bursary', () => {
    expect(autocatInc('NHSBSA BURSARY')).toBe('NHS Bursary');
  });
  it('classifies UCL stipend', () => {
    expect(autocatInc('UCL STIPEND')).toBe('UCL Stipend');
  });
  it('classifies Student Loan', () => {
    expect(autocatInc('SLC STUDENT LOAN')).toBe('Student Loan');
  });
  it('falls back to Family Support for unrecognised income', () => {
    expect(autocatInc('TRANSFER FROM MUM')).toBe('Family Support');
  });
});
