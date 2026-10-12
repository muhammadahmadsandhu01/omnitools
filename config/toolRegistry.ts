import type { ComponentType } from 'react';

// ============================================================
// Tool Functional Components
// ============================================================
import PreciousMetals from '@/components/tools/PreciousMetals';
import EmiCalculator from '@/components/tools/EmiCalculator';
import MortgageCalculator from '@/components/tools/MortgageCalculator';
import CompoundInterest from '@/components/tools/CompoundInterest';
import SipCalculator from '@/components/tools/SipCalculator';
import SalaryCalculator from '@/components/tools/SalaryCalculator';
import CryptoConverter from '@/components/tools/CryptoConverter';
import InvoiceGenerator from '@/components/tools/InvoiceGenerator';
import JsonFormatter from '@/components/tools/JsonFormatter';
import SvgOptimizer from '@/components/tools/SvgOptimizer';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import JsonConverter from '@/components/tools/JsonConverter';
import Base64Encoder from '@/components/tools/Base64Encoder';
import SqlFormatter from '@/components/tools/SqlFormatter';
import RegexTester from '@/components/tools/RegexTester';
import PdfMergeSplit from '@/components/tools/PdfMergeSplit';
import ImageToPdf from '@/components/tools/ImageToPdf';
import WebpToJpgPng from '@/components/tools/WebpToJpgPng';
import ImageCompressor from '@/components/tools/ImageCompressor';
import QrGenerator from '@/components/tools/QrGenerator';
import TextAnalyzer from '@/components/tools/TextAnalyzer';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import MetaGenerator from '@/components/tools/MetaGenerator';

// ============================================================
// SEO Landing Page Content Components
// ============================================================
import PreciousMetalsSeo from '@/components/seo/PreciousMetalsSeo';
import EmiCalculatorSeo from '@/components/seo/EmiCalculatorSeo';
import MortgageCalculatorSeo from '@/components/seo/MortgageCalculatorSeo';
import CompoundInterestSeo from '@/components/seo/CompoundInterestSeo';
import SipCalculatorSeo from '@/components/seo/SipCalculatorSeo';
import SalaryCalculatorSeo from '@/components/seo/SalaryCalculatorSeo';
import CryptoConverterSeo from '@/components/seo/CryptoConverterSeo';
import InvoiceGeneratorSeo from '@/components/seo/InvoiceGeneratorSeo';
import JsonFormatterSeo from '@/components/seo/JsonFormatterSeo';
import SvgOptimizerSeo from '@/components/seo/SvgOptimizerSeo';
import PasswordGeneratorSeo from '@/components/seo/PasswordGeneratorSeo';
import JsonConverterSeo from '@/components/seo/JsonConverterSeo';
import Base64EncoderSeo from '@/components/seo/Base64EncoderSeo';
import SqlFormatterSeo from '@/components/seo/SqlFormatterSeo';
import RegexTesterSeo from '@/components/seo/RegexTesterSeo';
import PdfMergeSplitSeo from '@/components/seo/PdfMergeSplitSeo';
import ImageToPdfSeo from '@/components/seo/ImageToPdfSeo';
import WebpToJpgPngSeo from '@/components/seo/WebpToJpgPngSeo';
import ImageCompressorSeo from '@/components/seo/ImageCompressorSeo';
import QrGeneratorSeo from '@/components/seo/QrGeneratorSeo';
import TextAnalyzerSeo from '@/components/seo/TextAnalyzerSeo';
import TextCaseConverterSeo from '@/components/seo/TextCaseConverterSeo';
import MetaGeneratorSeo from '@/components/seo/MetaGeneratorSeo';

/**
 * Functional tool component registry.
 * Maps tool slugs and legacy aliases to their interactive UI component.
 */
export const toolComponents: Record<string, ComponentType<Record<string, never>>> = {
  // Finance
  'precious-metals': PreciousMetals,
  'emi-calculator': EmiCalculator,
  'mortgage-calculator': MortgageCalculator,
  'compound-interest': CompoundInterest,
  'sip-calculator': SipCalculator,
  'salary-calculator': SalaryCalculator,
  'crypto-converter': CryptoConverter,
  'currency-converter': CryptoConverter, // Alias
  'invoice-generator': InvoiceGenerator,

  // Developer
  'json-formatter': JsonFormatter,
  'svg-optimizer': SvgOptimizer,
  'password-generator': PasswordGenerator,
  'json-converter': JsonConverter,
  'base64-encoder': Base64Encoder,
  'sql-formatter': SqlFormatter,
  'regex-tester': RegexTester,

  // Document
  'pdf-merge-split': PdfMergeSplit,
  'image-to-pdf': ImageToPdf,

  // Media
  'webp-to-jpg-png': WebpToJpgPng,
  'webp-converter': WebpToJpgPng, // Alias
  'image-compressor': ImageCompressor,

  // SEO & Text
  'qr-generator': QrGenerator,
  'text-analyzer': TextAnalyzer,
  'text-case-converter': TextCaseConverter,
  'case-converter': TextCaseConverter, // Alias
  'meta-generator': MetaGenerator,
  'meta-tags-generator': MetaGenerator, // Alias
  'open-graph-generator': MetaGenerator, // Alias
};

/**
 * SEO landing page content registry.
 * Maps tool slugs and legacy aliases to their rich informational landing component.
 */
export const seoComponents: Record<string, ComponentType<Record<string, never>>> = {
  // Finance
  'precious-metals': PreciousMetalsSeo,
  'emi-calculator': EmiCalculatorSeo,
  'mortgage-calculator': MortgageCalculatorSeo,
  'compound-interest': CompoundInterestSeo,
  'sip-calculator': SipCalculatorSeo,
  'salary-calculator': SalaryCalculatorSeo,
  'crypto-converter': CryptoConverterSeo,
  'currency-converter': CryptoConverterSeo, // Alias
  'invoice-generator': InvoiceGeneratorSeo,

  // Developer
  'json-formatter': JsonFormatterSeo,
  'svg-optimizer': SvgOptimizerSeo,
  'password-generator': PasswordGeneratorSeo,
  'json-converter': JsonConverterSeo,
  'base64-encoder': Base64EncoderSeo,
  'sql-formatter': SqlFormatterSeo,
  'regex-tester': RegexTesterSeo,

  // Document
  'pdf-merge-split': PdfMergeSplitSeo,
  'image-to-pdf': ImageToPdfSeo,

  // Media
  'webp-to-jpg-png': WebpToJpgPngSeo,
  'webp-converter': WebpToJpgPngSeo, // Alias
  'image-compressor': ImageCompressorSeo,

  // SEO & Text
  'qr-generator': QrGeneratorSeo,
  'text-analyzer': TextAnalyzerSeo,
  'text-case-converter': TextCaseConverterSeo,
  'case-converter': TextCaseConverterSeo, // Alias
  'meta-generator': MetaGeneratorSeo,
  'meta-tags-generator': MetaGeneratorSeo, // Alias
  'open-graph-generator': MetaGeneratorSeo, // Alias
};

/**
 * Retrieve the functional component for a given tool slug.
 */
export function getToolComponent(slug: string): ComponentType<Record<string, never>> | undefined {
  return toolComponents[slug];
}

/**
 * Retrieve the SEO landing content component for a given tool slug.
 */
export function getSeoComponent(slug: string): ComponentType<Record<string, never>> | undefined {
  return seoComponents[slug];
}
